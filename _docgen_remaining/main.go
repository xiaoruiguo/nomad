package main

import (
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

type FileInfo struct {
	FileName    string
	RelPath     string
	FilePath    string
	DirName     string
	PackageName string
	LineCount   int
	Copyright   string
	License     string
	Imports     []string
	Types       []TypeInfo
	Constants   []ConstInfo
	Variables   []VarInfo
	Functions   []FuncInfo
	BuildTags   string
	IsPlatform  bool
	Platform    string
}

type TypeInfo struct {
	Name    string
	Kind    string
	Fields  string
	Def     string
	Methods []string
	Line    int
}

type ConstInfo struct {
	Name  string
	Value string
}

type VarInfo struct {
	Name  string
	Value string
}

type FuncInfo struct {
	Name       string
	Receiver   string
	RcvVar     string
	Params     string
	Returns    string
	Line       int
	IsExported bool
}

func main() {
	rootDir := `d:\claude\nomad`

	skipDirs := map[string]bool{
		".tmp":             true,
		"node_modules":     true,
		"_docgen_nomad":    true,
		"_docgen_scheduler": true,
		"_docgen_helper":   true,
		"_docgen_client":   true,
		"vendor":           true,
	}

	var files []string
	err := filepath.Walk(rootDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			name := info.Name()
			if skipDirs[name] {
				return filepath.SkipDir
			}
			return nil
		}
		name := info.Name()
		if !strings.HasSuffix(name, ".go") {
			return nil
		}
		if strings.HasSuffix(name, "_test.go") {
			return nil
		}
		if strings.Contains(name, "generated") || strings.HasSuffix(name, ".pb.go") {
			return nil
		}
		// Skip files that already have .go.md
		if _, err := os.Stat(path + ".md"); err == nil {
			return nil
		}
		files = append(files, path)
		return nil
	})
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error walking directory: %v\n", err)
		os.Exit(1)
	}

	sort.Strings(files)
	total := len(files)
	fmt.Printf("Found %d files to analyze\n", total)

	count := 0
	errors := 0
	for _, filePath := range files {
		count++
		err := processFile(filePath, rootDir)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error processing %s: %v\n", filepath.Base(filePath), err)
			errors++
		}
		if count%20 == 0 {
			fmt.Printf("Progress: %d / %d\n", count, total)
		}
	}

	fmt.Printf("\nCompleted: %d / %d files processed, %d errors\n", count, total, errors)
}

func processFile(filePath, rootDir string) error {
	name := filepath.Base(filePath)
	content, err := os.ReadFile(filePath)
	if err != nil {
		return err
	}
	contentStr := string(content)
	lineCount := strings.Count(contentStr, "\n") + 1

	relPath, _ := filepath.Rel(rootDir, filePath)
	relPath = filepath.ToSlash(relPath)

	dirPath := filepath.Dir(filePath)
	dirName, _ := filepath.Rel(rootDir, dirPath)
	dirName = filepath.ToSlash(dirName)
	if dirName == "." {
		dirName = ""
	}

	info := FileInfo{
		FileName:    name,
		RelPath:     relPath,
		FilePath:    filePath,
		DirName:     dirName,
		PackageName: "main",
		LineCount:   lineCount,
	}

	// Detect platform-specific
	baseName := strings.TrimSuffix(name, ".go")
	platformSuffixes := map[string]string{
		"_linux":      "Linux",
		"_bsd":        "BSD",
		"_windows":    "Windows",
		"_darwin":     "macOS",
		"_default":    "默认/其他平台",
		"_unix":       "Unix-like",
		"_freebsd":    "FreeBSD",
		"_nonwindows": "非 Windows",
	}
	for suffix, plat := range platformSuffixes {
		if strings.HasSuffix(baseName, suffix) {
			info.IsPlatform = true
			info.Platform = plat
			break
		}
	}

	if m := regexp.MustCompile(`(?m)^//\s*(Copyright[^\r\n]*)`).FindStringSubmatch(contentStr); m != nil {
		info.Copyright = strings.TrimSpace(m[1])
	}
	if m := regexp.MustCompile(`(?m)^//\s*(SPDX-License-Identifier:[^\r\n]*)`).FindStringSubmatch(contentStr); m != nil {
		info.License = strings.TrimSpace(m[1])
	}
	if m := regexp.MustCompile(`(?m)^//go:build\s+(.+)$`).FindStringSubmatch(contentStr); m != nil {
		info.BuildTags = strings.TrimSpace(m[1])
	} else if m := regexp.MustCompile(`(?m)^//\s*\+build\s+(.+)$`).FindStringSubmatch(contentStr); m != nil {
		info.BuildTags = strings.TrimSpace(m[1])
	}

	fset := token.NewFileSet()
	f, err := parser.ParseFile(fset, filePath, content, parser.ParseComments)
	if err != nil {
		return processFileRegex(info, contentStr, rootDir)
	}

	info.PackageName = f.Name.Name

	for _, imp := range f.Imports {
		path := strings.Trim(imp.Path.Value, `"`)
		info.Imports = append(info.Imports, path)
	}

	typeMethods := map[string][]string{}
	for _, decl := range f.Decls {
		if funcDecl, ok := decl.(*ast.FuncDecl); ok && funcDecl.Recv != nil {
			if len(funcDecl.Recv.List) > 0 {
				recvType := exprString(funcDecl.Recv.List[0].Type)
				recvType = strings.TrimPrefix(recvType, "*")
				typeMethods[recvType] = append(typeMethods[recvType], funcDecl.Name.Name)
			}
		}
	}

	for _, decl := range f.Decls {
		switch d := decl.(type) {
		case *ast.GenDecl:
			switch d.Tok {
			case token.TYPE:
				for _, spec := range d.Specs {
					ts := spec.(*ast.TypeSpec)
					typeInfo := TypeInfo{
						Name: ts.Name.Name,
						Line: fset.Position(ts.Pos()).Line,
					}
					switch st := ts.Type.(type) {
					case *ast.StructType:
						typeInfo.Kind = "struct"
						if st.Fields != nil {
							var fields []string
							for _, field := range st.Fields.List {
								if len(field.Names) == 0 {
									typeStr := exprString(field.Type)
									fields = append(fields, typeStr)
								} else {
									names := []string{}
									for _, n := range field.Names {
										names = append(names, n.Name)
									}
									typeStr := exprString(field.Type)
									tag := ""
									if field.Tag != nil {
										tag = field.Tag.Value
									}
									line := strings.Join(names, ", ") + " " + typeStr
									if tag != "" {
										line += " " + tag
									}
									fields = append(fields, line)
								}
							}
							typeInfo.Fields = strings.Join(fields, "\n")
						}
					case *ast.InterfaceType:
						typeInfo.Kind = "interface"
						if st.Methods != nil {
							var methods []string
							for _, m := range st.Methods.List {
								if len(m.Names) > 0 {
									methods = append(methods, m.Names[0].Name)
								} else {
									methods = append(methods, exprString(m.Type))
								}
							}
							typeInfo.Fields = strings.Join(methods, "\n")
						}
					default:
						typeInfo.Kind = "type"
						typeInfo.Def = exprString(st)
					}
					typeInfo.Methods = typeMethods[ts.Name.Name]
					info.Types = append(info.Types, typeInfo)
				}
			case token.CONST:
				for _, spec := range d.Specs {
					vs := spec.(*ast.ValueSpec)
					for i, n := range vs.Names {
						val := ""
						if i < len(vs.Values) {
							val = exprString(vs.Values[i])
						}
						info.Constants = append(info.Constants, ConstInfo{
							Name:  n.Name,
							Value: val,
						})
					}
				}
			case token.VAR:
				for _, spec := range d.Specs {
					vs := spec.(*ast.ValueSpec)
					for i, n := range vs.Names {
						val := ""
						if i < len(vs.Values) {
							val = exprString(vs.Values[i])
						}
						info.Variables = append(info.Variables, VarInfo{
							Name:  n.Name,
							Value: val,
						})
					}
				}
			}
		case *ast.FuncDecl:
			funcInfo := FuncInfo{
				Name:       d.Name.Name,
				Line:       fset.Position(d.Pos()).Line,
				IsExported: d.Name.IsExported(),
			}
			if d.Recv != nil && len(d.Recv.List) > 0 {
				recvField := d.Recv.List[0]
				if len(recvField.Names) > 0 {
					funcInfo.RcvVar = recvField.Names[0].Name
				}
				recvTypeStr := exprString(recvField.Type)
				funcInfo.Receiver = strings.TrimPrefix(recvTypeStr, "*")
			}
			if d.Type.Params != nil {
				var params []string
				for _, param := range d.Type.Params.List {
					typeStr := exprString(param.Type)
					if len(param.Names) == 0 {
						params = append(params, typeStr)
					} else {
						for _, pn := range param.Names {
							params = append(params, pn.Name+" "+typeStr)
						}
					}
				}
				funcInfo.Params = strings.Join(params, ", ")
			}
			if d.Type.Results != nil {
				var results []string
				for _, result := range d.Type.Results.List {
					typeStr := exprString(result.Type)
					if len(result.Names) == 0 {
						results = append(results, typeStr)
					} else {
						for _, rn := range result.Names {
							results = append(results, rn.Name+" "+typeStr)
						}
					}
				}
				funcInfo.Returns = strings.Join(results, ", ")
			}
			info.Functions = append(info.Functions, funcInfo)
		}
	}

	return generateMarkdown(info, rootDir)
}

func processFileRegex(info FileInfo, content, rootDir string) error {
	if m := regexp.MustCompile(`(?m)^package\s+(\S+)`).FindStringSubmatch(content); m != nil {
		info.PackageName = m[1]
	}
	importRe := regexp.MustCompile(`(?ms)import\s*\((.*?)\)`)
	if m := importRe.FindStringSubmatch(content); m != nil {
		lines := strings.Split(m[1], "\n")
		for _, line := range lines {
			line = strings.TrimSpace(line)
			if line == "" || strings.HasPrefix(line, "//") {
				continue
			}
			if sm := regexp.MustCompile(`"([^"]+)"`).FindStringSubmatch(line); sm != nil {
				info.Imports = append(info.Imports, sm[1])
			}
		}
	}
	funcRe := regexp.MustCompile(`(?m)^func\s+(?:\((\w+)\s+\*?(\w+)\)\s+)?(\w+)\s*\(([^)]*)\)\s*(.*?)\s*\{`)
	matches := funcRe.FindAllStringSubmatch(content, -1)
	for _, m := range matches {
		lineNum := strings.Count(content[:strings.Index(content, m[0])], "\n") + 1
		info.Functions = append(info.Functions, FuncInfo{
			Name:     m[3],
			Receiver: m[2],
			RcvVar:   m[1],
			Params:   strings.TrimSpace(m[4]),
			Returns:  strings.TrimSpace(m[5]),
			Line:     lineNum,
		})
	}
	return generateMarkdown(info, rootDir)
}

func generateMarkdown(info FileInfo, rootDir string) error {
	var md strings.Builder

	fileURI := "file:///d:/claude/nomad/" + info.RelPath

	md.WriteString(fmt.Sprintf("# %s 代码说明文档\n\n", info.FileName))
	md.WriteString(fmt.Sprintf("> 文件路径：[%s](%s)\n", info.RelPath, fileURI))
	md.WriteString(fmt.Sprintf("> 总行数：%d 行\n", info.LineCount))
	md.WriteString(fmt.Sprintf("> 所属包：`%s`\n", info.PackageName))
	if info.Copyright != "" {
		md.WriteString(fmt.Sprintf("> 版权：%s\n", info.Copyright))
	}
	if info.License != "" {
		md.WriteString(fmt.Sprintf("> 许可证：%s\n", info.License))
	}
	if info.BuildTags != "" {
		md.WriteString(fmt.Sprintf("> Build Tag：`%s`\n", info.BuildTags))
	}
	md.WriteString("\n---\n\n")

	// Section 1
	md.WriteString("## 1. 文件定位与核心职责\n\n")
	md.WriteString(categorizeFile(info))
	if info.IsPlatform {
		md.WriteString(fmt.Sprintf("\n**平台特定实现**：此文件为 **%s** 平台专用，通过 build tag 机制在编译时选择。\n", info.Platform))
	}
	if info.BuildTags != "" && !info.IsPlatform {
		md.WriteString(fmt.Sprintf("\n**构建标签**：`%s`\n", info.BuildTags))
	}
	md.WriteString("\n")

	// Section 2: Types
	md.WriteString("## 2. 类型定义\n\n")
	if len(info.Types) > 0 {
		for _, t := range info.Types {
			md.WriteString(fmt.Sprintf("### %s\n\n", t.Name))
			md.WriteString(fmt.Sprintf("**定义位置**：[L%d](%s#L%d)\n\n", t.Line, fileURI, t.Line))
			if t.Kind == "struct" {
				md.WriteString("**类型**：struct\n\n")
				if t.Fields != "" {
					md.WriteString("```go\n")
					for _, f := range strings.Split(t.Fields, "\n") {
						md.WriteString("\t" + f + "\n")
					}
					md.WriteString("```\n\n")
				}
			} else if t.Kind == "interface" {
				md.WriteString("**类型**：interface\n\n")
				if t.Fields != "" {
					md.WriteString("```go\n")
					for _, f := range strings.Split(t.Fields, "\n") {
						md.WriteString("\t" + f + "\n")
					}
					md.WriteString("```\n\n")
				}
			} else {
				md.WriteString(fmt.Sprintf("**类型定义**：`%s`\n\n", t.Def))
			}
			if len(t.Methods) > 0 {
				md.WriteString(fmt.Sprintf("**关联方法**（%d 个）：%s\n\n", len(t.Methods), "`"+strings.Join(t.Methods, "`, `")+"`"))
			}
		}
	} else {
		md.WriteString("该文件未定义类型。\n\n")
	}

	// Section 3: Constants and Variables
	md.WriteString("## 3. 常量与变量\n\n")
	hasConst := false
	if len(info.Constants) > 0 {
		hasConst = true
		md.WriteString("### 常量\n\n")
		md.WriteString("| 名称 | 值 |\n")
		md.WriteString("|------|----|\n")
		for _, c := range info.Constants {
			val := strings.ReplaceAll(c.Value, "|", "\\|")
			if len(val) > 60 {
				val = val[:57] + "..."
			}
			md.WriteString(fmt.Sprintf("| `%s` | `%s` |\n", c.Name, val))
		}
		md.WriteString("\n")
	}
	if len(info.Variables) > 0 {
		hasConst = true
		md.WriteString("### 变量\n\n")
		md.WriteString("| 名称 | 值 |\n")
		md.WriteString("|------|----|\n")
		for _, v := range info.Variables {
			val := strings.ReplaceAll(v.Value, "|", "\\|")
			if len(val) > 60 {
				val = val[:57] + "..."
			}
			md.WriteString(fmt.Sprintf("| `%s` | `%s` |\n", v.Name, val))
		}
		md.WriteString("\n")
	}
	if !hasConst {
		md.WriteString("该文件未定义顶级常量或变量。\n\n")
	}

	// Section 4: Functions
	md.WriteString("## 4. 方法与函数\n\n")
	if len(info.Functions) > 0 {
		md.WriteString("| 方法 | 接收者 | 参数 | 返回值 | 行号 |\n")
		md.WriteString("|------|--------|------|--------|------|\n")
		for _, f := range info.Functions {
			recv := "-"
			if f.Receiver != "" {
				recv = fmt.Sprintf("`%s *%s`", f.RcvVar, f.Receiver)
			}
			params := "-"
			if f.Params != "" {
				params = fmt.Sprintf("`%s`", f.Params)
			}
			returns := "-"
			if f.Returns != "" {
				returns = fmt.Sprintf("`%s`", f.Returns)
			}
			params = strings.ReplaceAll(params, "|", "\\|")
			returns = strings.ReplaceAll(returns, "|", "\\|")
			if len(params) > 80 {
				params = params[:77] + "...`"
			}
			if len(returns) > 60 {
				returns = returns[:57] + "...`"
			}
			md.WriteString(fmt.Sprintf("| `%s` | %s | %s | %s | [L%d](%s#L%d) |\n",
				f.Name, recv, params, returns, f.Line, fileURI, f.Line))
		}
		md.WriteString("\n")
	} else {
		md.WriteString("该文件未定义方法。\n\n")
	}

	// Section 5: Key methods detail
	md.WriteString("## 5. 核心方法详解\n\n")
	keyMethods := map[string]bool{
		"New": true, "List": true, "Info": true, "Get": true, "Create": true,
		"Update": true, "Delete": true, "Register": true, "Deregister": true,
		"Parse": true, "Validate": true, "Read": true, "Write": true,
		"Run": true, "Init": true, "Start": true, "Shutdown": true,
		"Apply": true, "Wait": true, "Close": true, "Snapshot": true,
		"Restore": true, "Lookup": true, "Open": true, "Copy": true,
		"Backoff": true, "Retry": true, "Dispense": true, "Reattach": true,
		"Catalog": true, "Generate": true, "Execute": true, "Launch": true,
		"Stop": true, "Destroy": true, "Inspect": true, "Stats": true,
		"Signal": true, "Fingerprint": true, "Recover": true,
		"Dispatch": true, "Scale": true, "Plan": true, "Submit": true,
		"Evaluate": true, "Allocate": true, "Deploy": true, "Reconcile": true,
		"Process": true, "Handle": true, "Serve": true, "Main": true,
	}
	detailedCount := 0
	for _, f := range info.Functions {
		if !f.IsExported || detailedCount >= 8 {
			continue
		}
		if keyMethods[f.Name] || strings.HasPrefix(f.Name, "New") {
			md.WriteString(fmt.Sprintf("### %s()\n\n", f.Name))
			if f.Receiver != "" {
				md.WriteString(fmt.Sprintf("**签名**：`func (%s *%s) %s(%s) %s`\n\n", f.RcvVar, f.Receiver, f.Name, f.Params, f.Returns))
			} else {
				md.WriteString(fmt.Sprintf("**签名**：`func %s(%s) %s`\n\n", f.Name, f.Params, f.Returns))
			}
			md.WriteString(fmt.Sprintf("**位置**：[L%d](%s#L%d)\n\n", f.Line, fileURI, f.Line))
			detailedCount++
		}
	}

	// Section 6: Dependencies
	md.WriteString("## 6. 依赖关系\n\n")
	if len(info.Imports) > 0 {
		md.WriteString("### 导入包\n\n")
		md.WriteString("| 包路径 | 类型 |\n")
		md.WriteString("|--------|------|\n")
		stdLib, internal, thirdParty := []string{}, []string{}, []string{}
		for _, imp := range info.Imports {
			if strings.HasPrefix(imp, "github.com/hashicorp/nomad/") {
				internal = append(internal, imp)
			} else if strings.HasPrefix(imp, "github.com/") || strings.Contains(imp, "golang.org/x/") {
				thirdParty = append(thirdParty, imp)
			} else {
				stdLib = append(stdLib, imp)
			}
		}
		sort.Strings(stdLib)
		sort.Strings(internal)
		sort.Strings(thirdParty)
		for _, imp := range stdLib {
			impSafe := strings.ReplaceAll(imp, "|", "\\|")
			md.WriteString(fmt.Sprintf("| `%s` | 标准库 |\n", impSafe))
		}
		for _, imp := range internal {
			impSafe := strings.ReplaceAll(imp, "|", "\\|")
			md.WriteString(fmt.Sprintf("| `%s` | 内部包 |\n", impSafe))
		}
		for _, imp := range thirdParty {
			impSafe := strings.ReplaceAll(imp, "|", "\\|")
			md.WriteString(fmt.Sprintf("| `%s` | 第三方库 |\n", impSafe))
		}
		md.WriteString("\n")
	}

	// Section 7: Design patterns
	md.WriteString("## 7. 设计模式与技术特点\n\n")
	md.WriteString(describePatterns(info))

	// Section 8: Related files
	md.WriteString("## 8. 相关文件\n\n")
	md.WriteString("| 文件 | 关系 |\n")
	md.WriteString("|------|------|\n")

	testFile := strings.TrimSuffix(info.FileName, ".go") + "_test.go"
	testPath := filepath.Join(filepath.Dir(info.FilePath), testFile)
	if _, err := os.Stat(testPath); err == nil {
		testURI := "file:///d:/claude/nomad/" + filepath.ToSlash(strings.TrimPrefix(testPath, rootDir+string(filepath.Separator)))
		md.WriteString(fmt.Sprintf("| [%s](%s) | 对应测试文件 |\n", testFile, testURI))
	}
	md.WriteString("\n")

	outPath := info.FilePath + ".md"
	return os.WriteFile(outPath, []byte(md.String()), 0644)
}

func categorizeFile(info FileInfo) string {
	name := info.FileName
	baseName := strings.TrimSuffix(name, ".go")
	dirName := info.DirName

	// Remove platform/CE suffix for categorization
	cleanBase := baseName
	for _, suffix := range []string{"_linux", "_bsd", "_windows", "_darwin", "_default", "_unix", "_freebsd", "_ce", "_nonwindows", "_cgo", "_testing"} {
		cleanBase = strings.TrimSuffix(cleanBase, suffix)
	}

	// Root main.go
	if dirName == "" && name == "main.go" {
		return "该文件是 **Nomad 主入口**（`main` 包），实现命令行命令分发。通过导入各子命令包的 `init()` 函数注册命令，使用 `commands` 字典将命令名映射到工厂函数，解析命令行参数后调用对应命令的 `Run` 方法。还包含 `version` 和 `version-monotonic` 等内置命令的实现。\n"
	}

	// version/
	if dirName == "version" {
		return "该文件属于 **版本信息子包**（`version`），定义 Nomad 的构建元数据（GitCommit、BuildDate、GitDescribe、Version 等），通过编译时注入的方式填充版本信息，用于 `nomad version` 命令和 HTTP API 的版本端点。\n"
	}

	// analysis/
	if dirName == "analysis" {
		return "该文件属于 **分析工具**（`analysis`），是独立的命令行工具，用于分析 Nomad 的性能数据、配置或行为，通常作为开发辅助工具使用。\n"
	}

	// demo/
	if strings.HasPrefix(dirName, "demo") {
		return "该文件属于 **示例代码**（`demo/`），提供 Nomad 的使用示例和演示程序，展示如何与 Nomad API 交互或部署示例工作负载。\n"
	}

	// ci/
	if dirName == "ci" {
		return "该文件属于 **CI/CD 工具**（`ci/`），提供持续集成测试用的辅助函数，包括非 root 用户跳过测试、慢测试标记和端口管理等。\n"
	}

	// tools/
	if strings.HasPrefix(dirName, "tools") {
		return "该文件属于 **构建工具**（`tools/`），提供 Nomad 构建过程的辅助工具，如测试分组管理（`tools/missing`）和命令行入口生成（`tools/cl-entry`）。\n"
	}

	// command/
	if strings.HasPrefix(dirName, "command") {
		return categorizeCommand(info, cleanBase)
	}

	// drivers/
	if strings.HasPrefix(dirName, "drivers") {
		return categorizeDrivers(info, cleanBase)
	}

	// e2e/
	if strings.HasPrefix(dirName, "e2e") {
		return categorizeE2e(info, cleanBase)
	}

	// plugins/
	if strings.HasPrefix(dirName, "plugins") {
		return categorizePlugins(info, cleanBase)
	}

	// lib/
	if strings.HasPrefix(dirName, "lib") {
		return categorizeLib(info, cleanBase)
	}

	// jobspec2/
	if strings.HasPrefix(dirName, "jobspec2") {
		return categorizeJobspec2(info, cleanBase)
	}

	// testutil/
	if strings.HasPrefix(dirName, "testutil") {
		return categorizeTestutil(info, cleanBase)
	}

	return fmt.Sprintf("该文件属于 Nomad 项目的 `%s` 模块，提供相关功能实现。\n", dirName)
}

func categorizeCommand(info FileInfo, cleanBase string) string {
	dirName := info.DirName
	switch {
	case strings.HasPrefix(dirName, "command/agent"):
		return "该文件属于 **Agent 命令子包**（`command/agent`），实现 `nomad agent` 命令，启动 Nomad Agent 进程（Server 和/或 Client 模式），加载配置、初始化日志和信号处理。\n"
	case strings.HasPrefix(dirName, "command/asset"):
		return "该文件属于 **资产子包**（`command/asset`），管理 Nomad CLI 编译时嵌入的静态资产（如 Web UI 资源），通过 `go:embed` 或 `bindata` 机制打包。\n"
	}
	return "该文件属于 **CLI 命令子包**（`command/`），实现 Nomad 命令行工具的子命令，每个命令封装对应的 API 调用和参数处理。\n"
}

func categorizeDrivers(info FileInfo, cleanBase string) string {
	dirName := info.DirName
	switch {
	case strings.HasPrefix(dirName, "drivers/docker"):
		return "该文件属于 **Docker 驱动子包**（`drivers/docker`），实现 Nomad 的 Docker 任务驱动，通过 Docker API 管理容器的生命周期（创建、启动、停止、销毁）、资源限制、网络配置和日志收集。支持 Docker API 版本协商、认证、健康检查和统计信息收集。\n"
	case strings.HasPrefix(dirName, "drivers/exec"):
		return "该文件属于 **Exec 驱动子包**（`drivers/exec`），实现 Nomad 的隔离执行驱动，使用 chroot/isolation 隔离运行任意二进制文件，支持资源限制和 cgroups 集成。\n"
	case strings.HasPrefix(dirName, "drivers/java"):
		return "该文件属于 **Java 驱动子包**（`drivers/java`），实现 Nomad 的 Java 任务驱动，通过 JVM 运行 Java 应用程序（jar 文件），支持 JVM 参数配置和进程管理。\n"
	case strings.HasPrefix(dirName, "drivers/qemu"):
		return "该文件属于 **QEMU 驱动子包**（`drivers/qemu`），实现 Nomad 的 QEMU 任务驱动，通过 QEMU 虚拟机运行镜像文件，支持端口映射和资源限制。\n"
	case strings.HasPrefix(dirName, "drivers/rawexec"):
		return "该文件属于 **Raw Exec 驱动子包**（`drivers/rawexec`），实现 Nomad 的原始执行驱动，直接在主机上运行命令（无隔离），用于无法使用容器化或隔离的场景，不推荐在生产环境使用。\n"
	case strings.HasPrefix(dirName, "drivers/mock"):
		return "该文件属于 **Mock 驱动子包**（`drivers/mock`），实现 Nomad 的模拟驱动，用于测试和开发，模拟任务执行的各种状态和行为（成功、失败、日志等）。\n"
	case strings.HasPrefix(dirName, "drivers/shared"):
		return "该文件属于 **驱动共享工具子包**（`drivers/shared`），提供各任务驱动的共享功能，包括驱动事件处理、重启策略、执行器接口、网络配置、资源隔离和选择器逻辑等。\n"
	}
	return "该文件属于 **任务驱动子包**（`drivers/`），实现 Nomad 支持的任务驱动，每个驱动负责特定运行时（容器、进程、虚拟机）的任务生命周期管理。\n"
}

func categorizeE2e(info FileInfo, cleanBase string) string {
	dirName := info.DirName
	switch {
	case strings.HasPrefix(dirName, "e2e/e2eutil"):
		return "该文件属于 **E2E 测试工具子包**（`e2e/e2eutil`），提供端到端测试的共享工具函数，包括 Nomad 客户端创建、作业提交、分配查询、等待逻辑和断言辅助等，是所有 E2E 测试的基础设施。\n"
	case strings.HasPrefix(dirName, "e2e/framework"):
		return "该文件属于 **E2E 测试框架子包**（`e2e/framework`），实现端到端测试的框架基础设施，包括测试套件组织、Setup/Teardown 机制、断言工具和测试运行器。\n"
	case strings.HasPrefix(dirName, "e2e/v3"):
		return "该文件属于 **E2E v3 测试框架子包**（`e2e/v3`），实现新一代端到端测试框架，提供更结构化的测试编写模式和更丰富的断言工具。\n"
	case strings.HasPrefix(dirName, "e2e/consul"):
		return "该文件属于 **Consul 集成 E2E 测试子包**（`e2e/consul`），测试 Nomad 与 Consul 的服务发现、服务注册和 Connect 集成功能。\n"
	case strings.HasPrefix(dirName, "e2e/csi"):
		return "该文件属于 **CSI E2E 测试子包**（`e2e/csi`），测试容器存储接口（CSI）插件的注册、卷管理和挂载功能。\n"
	case strings.HasPrefix(dirName, "e2e/acl"):
		return "该文件属于 **ACL E2E 测试子包**（`e2e/acl`），测试 Nomad 的访问控制列表（ACL）功能，包括策略管理、令牌认证和权限验证。\n"
	}
	return fmt.Sprintf("该文件属于 **端到端测试子包**（`e2e/%s`），针对 Nomad 的特定功能领域编写端到端测试，通过真实的 Nomad 集群验证功能正确性。\n", strings.TrimPrefix(dirName, "e2e/"))
}

func categorizePlugins(info FileInfo, cleanBase string) string {
	dirName := info.DirName
	switch {
	case dirName == "plugins" || info.RelPath == "plugins/serve.go":
		return "该文件属于 **插件根包**（`plugins/`），定义插件系统的核心接口和工具，包括插件服务入口、插件类型注册和插件工厂函数。\n"
	case strings.HasPrefix(dirName, "plugins/base"):
		return "该文件属于 **基础插件接口子包**（`plugins/base`），定义所有 Nomad 插件必须实现的基础接口，包括插件信息查询、配置设置、TLS 证书设置和 gRPC 通信协议。同时包含 gRPC protobuf 生成的客户端和服务端实现。\n"
	case strings.HasPrefix(dirName, "plugins/drivers"):
		return "该文件属于 **驱动插件接口子包**（`plugins/drivers`），定义任务驱动插件的接口规范，包括任务生命周期管理（Fingerprint、Launch、Stop、Destroy、Signal）、统计信息收集、能力声明和 gRPC 通信协议。是所有任务驱动（Docker、Java、QEMU 等）的接口契约。\n"
	case strings.HasPrefix(dirName, "plugins/device"):
		return "该文件属于 **设备插件接口子包**（`plugins/device`），定义设备插件的接口规范，用于发现和管理硬件设备（GPU、FPGA 等），包括设备指纹采集、资源预留和挂载管理，通过 gRPC 与 Nomad 通信。\n"
	case strings.HasPrefix(dirName, "plugins/shared"):
		return "该文件属于 **插件共享工具子包**（`plugins/shared`），提供插件系统各组件共享的工具，包括 HCL 规格序列化、gRPC 流式日志转发和 proto 工具函数。\n"
	case strings.HasPrefix(dirName, "plugins/csi"):
		return "该文件属于 **CSI 插件接口子包**（`plugins/csi`），定义容器存储接口（CSI）插件的客户端实现，通过 gRPC 与 CSI 控制器和节点服务通信，管理卷的创建、挂载和快照。\n"
	}
	return "该文件属于 **插件子系统**（`plugins/`），定义 Nomad 插件系统的接口和实现，支持任务驱动、设备管理和 CSI 存储等插件类型。\n"
}

func categorizeLib(info FileInfo, cleanBase string) string {
	dirName := info.DirName
	switch {
	case strings.HasPrefix(dirName, "lib/auth"):
		return "该文件属于 **认证库子包**（`lib/auth`），实现 Nomad 的认证辅助功能，包括 OIDC（OpenID Connect）和 SSO 集成、令牌管理和认证流程处理。\n"
	case strings.HasPrefix(dirName, "lib/lang"):
		return "该文件属于 **语言工具子包**（`lib/lang`），提供 Go 语言的通用工具函数，包括类型转换、反射辅助和泛型工具。\n"
	case strings.HasPrefix(dirName, "lib/resolvconf"):
		return "该文件属于 **DNS 解析配置子包**（`lib/resolvconf`），实现 `/etc/resolv.conf` 文件的解析和生成，用于任务网络的 DNS 配置。\n"
	case strings.HasPrefix(dirName, "lib/delayheap"):
		return "该文件属于 **延迟堆子包**（`lib/delayheap`），实现基于堆的延迟队列数据结构，用于按时间顺序处理延迟任务（如周期性作业、评估延迟）。\n"
	case strings.HasPrefix(dirName, "lib/file"):
		return "该文件属于 **文件工具子包**（`lib/file`），提供文件操作的高级工具函数，包括原子写入和文件锁管理。\n"
	case strings.HasPrefix(dirName, "lib/kheap"):
		return "该文件属于 **K 堆子包**（`lib/kheap`），实现泛型堆数据结构，支持 Top-K 查询，用于调度器和资源排序。\n"
	}
	return "该文件属于 **基础库子包**（`lib/`），提供 Nomad 使用的通用库函数和数据结构。\n"
}

func categorizeJobspec2(info FileInfo, cleanBase string) string {
	dirName := info.DirName
	switch {
	case strings.HasPrefix(dirName, "jobspec2/addrs"):
		return "该文件属于 **地址解析子包**（`jobspec2/addrs`），实现 jobspec 中的地址解析逻辑，处理服务和网络地址的引用和解析。\n"
	case strings.HasPrefix(dirName, "jobspec2/hclutil"):
		return "该文件属于 **HCL 工具子包**（`jobspec2/hclutil`），提供 HCL 解析的辅助工具函数，支持 jobspec 的 HCL 语法解析和转换。\n"
	}
	return "该文件属于 **Jobspec v2 解析子包**（`jobspec2/`），实现 Nomad 作业规范（jobspec）的 HCL 解析、验证和转换，将用户编写的 HCL 配置转换为内部 API 对象。支持变量插值、函数调用和 HCL 到 JSON 的转换。\n"
}

func categorizeTestutil(info FileInfo, cleanBase string) string {
	return "该文件属于 **测试工具子包**（`testutil/`），提供 Nomad 测试的基础设施，包括测试服务器启动（`server.go`）、TLS 配置、Vault 集成、HTTP 响应记录器和等待/重试工具，用于单元测试和集成测试。\n"
}

func describePatterns(info FileInfo) string {
	var patterns []string

	// Check for interface definitions
	hasInterface := false
	for _, t := range info.Types {
		if t.Kind == "interface" {
			hasInterface = true
			break
		}
	}
	if hasInterface {
		patterns = append(patterns, "- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟")
	}

	// Check for context.Context usage
	hasContext := false
	for _, f := range info.Functions {
		if strings.Contains(f.Params, "context.Context") {
			hasContext = true
			break
		}
	}
	if hasContext {
		patterns = append(patterns, "- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制")
	}

	// Check for sync primitives
	hasSync := false
	for _, imp := range info.Imports {
		if imp == "sync" || imp == "sync/atomic" {
			hasSync = true
			break
		}
	}
	if hasSync {
		patterns = append(patterns, "- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态")
	}

	// Check for error handling
	errorCount := 0
	for _, f := range info.Functions {
		if strings.Contains(f.Returns, "error") {
			errorCount++
		}
	}
	if errorCount > 3 {
		patterns = append(patterns, "- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例")
	}

	// Check for io operations
	hasIO := false
	for _, imp := range info.Imports {
		if imp == "io" || imp == "io/fs" || imp == "os" {
			hasIO = true
			break
		}
	}
	if hasIO {
		patterns = append(patterns, "- **IO 操作**：涉及文件或数据流的读写操作")
	}

	// Check for crypto/tls
	for _, imp := range info.Imports {
		if strings.HasPrefix(imp, "crypto/") || imp == "crypto/tls" {
			patterns = append(patterns, "- **加密安全**：使用 Go crypto 标准库实现加密、签名或 TLS 通信")
			break
		}
	}

	// Check for plugin pattern
	for _, imp := range info.Imports {
		if strings.Contains(imp, "go-plugin") {
			patterns = append(patterns, "- **插件架构**：使用 `go-plugin` 框架实现插件化扩展")
			break
		}
	}

	// Check for gRPC
	for _, imp := range info.Imports {
		if strings.Contains(imp, "grpc") || strings.Contains(imp, "protobuf") {
			patterns = append(patterns, "- **gRPC 通信**：使用 gRPC 进行进程间通信")
			break
		}
	}

	// Check for Raft
	for _, imp := range info.Imports {
		if strings.Contains(imp, "raft") {
			patterns = append(patterns, "- **Raft 集成**：与 HashiCorp Raft 库交互，处理共识协议相关操作")
			break
		}
	}

	// Check for HCL
	for _, imp := range info.Imports {
		if strings.Contains(imp, "hcl") {
			patterns = append(patterns, "- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析")
			break
		}
	}

	// Check for struct tags
	for _, t := range info.Types {
		if strings.Contains(t.Fields, "json:") || strings.Contains(t.Fields, "hcl:") || strings.Contains(t.Fields, "mapstructure:") {
			patterns = append(patterns, "- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析")
			break
		}
	}

	// Check for logger
	for _, imp := range info.Imports {
		if strings.Contains(imp, "hclog") || strings.Contains(imp, "go-hclog") {
			patterns = append(patterns, "- **结构化日志**：使用 `hclog` 进行结构化日志记录")
			break
		}
	}

	// Check for metrics
	for _, imp := range info.Imports {
		if strings.Contains(imp, "metrics") {
			patterns = append(patterns, "- **指标收集**：使用 `go-metrics` 收集运行时指标")
			break
		}
	}

	// Check for platform-specific
	if info.IsPlatform {
		patterns = append(patterns, fmt.Sprintf("- **平台特定实现**：通过 build tag 机制实现 %s 平台支持", info.Platform))
	}

	// Check for CE/Enterprise
	if strings.HasSuffix(info.FileName, "_ce.go") {
		patterns = append(patterns, "- **社区版存根**：为企业版功能提供社区版的空实现，通过 build tag 选择")
	}

	// Check for testing utilities
	if strings.HasSuffix(info.FileName, "_testing.go") || info.DirName == "testlog" || info.DirName == "testtask" || info.DirName == "testutil" {
		patterns = append(patterns, "- **测试工具**：提供测试辅助工具，便于编写单元测试和集成测试")
	}

	// Check for generics (type parameters)
	for _, t := range info.Types {
		if strings.Contains(t.Def, "[T") || strings.Contains(t.Def, "[T ") {
			patterns = append(patterns, "- **泛型编程**：使用 Go 泛型实现类型安全的通用工具")
			break
		}
	}

	// Check for caching pattern
	for _, t := range info.Types {
		if strings.Contains(t.Name, "Cache") || strings.Contains(t.Name, "cache") {
			patterns = append(patterns, "- **缓存模式**：实现缓存机制，减少重复计算或 I/O 操作")
			break
		}
	}

	// Check for pool pattern
	for _, t := range info.Types {
		if strings.Contains(t.Name, "Pool") || strings.Contains(t.Name, "pool") {
			patterns = append(patterns, "- **对象池模式**：实现对象池，复用资源减少分配开销")
			break
		}
	}

	// Check for e2e test pattern
	if strings.HasPrefix(info.DirName, "e2e") {
		patterns = append(patterns, "- **端到端测试**：通过真实 Nomad 集群验证功能，使用测试框架组织测试用例")
	}

	// Check for driver pattern
	if strings.HasPrefix(info.DirName, "drivers") {
		patterns = append(patterns, "- **任务驱动**：实现 Nomad 任务驱动接口，管理任务的完整生命周期")
	}

	// Check for Docker
	for _, imp := range info.Imports {
		if strings.Contains(imp, "docker") {
			patterns = append(patterns, "- **Docker 集成**：与 Docker Engine API 交互，管理容器生命周期")
			break
		}
	}

	if len(patterns) == 0 {
		patterns = append(patterns, "- 遵循 Go 标准代码组织规范，作为 Nomad 项目的一部分")
	}

	return strings.Join(patterns, "\n") + "\n\n"
}

func exprString(expr ast.Expr) string {
	switch e := expr.(type) {
	case *ast.Ident:
		return e.Name
	case *ast.StarExpr:
		return "*" + exprString(e.X)
	case *ast.SelectorExpr:
		return exprString(e.X) + "." + e.Sel.Name
	case *ast.ArrayType:
		return "[]" + exprString(e.Elt)
	case *ast.MapType:
		return "map[" + exprString(e.Key) + "]" + exprString(e.Value)
	case *ast.InterfaceType:
		return "interface{}"
	case *ast.FuncType:
		return "func(...)"
	case *ast.BasicLit:
		return e.Value
	case *ast.Ellipsis:
		return "..." + exprString(e.Elt)
	case *ast.StructType:
		return "struct{...}"
	case *ast.ChanType:
		return "chan " + exprString(e.Value)
	case *ast.UnaryExpr:
		return e.Op.String() + exprString(e.X)
	case *ast.BinaryExpr:
		return exprString(e.X) + " " + e.Op.String() + " " + exprString(e.Y)
	case *ast.ParenExpr:
		return "(" + exprString(e.X) + ")"
	case *ast.IndexExpr:
		return exprString(e.X) + "[" + exprString(e.Index) + "]"
	case *ast.IndexListExpr:
		var indices []string
		for _, idx := range e.Indices {
			indices = append(indices, exprString(idx))
		}
		return exprString(e.X) + "[" + strings.Join(indices, ", ") + "]"
	case *ast.CallExpr:
		var args []string
		for _, arg := range e.Args {
			args = append(args, exprString(arg))
		}
		return exprString(e.Fun) + "(" + strings.Join(args, ", ") + ")"
	case *ast.CompositeLit:
		return exprString(e.Type) + "{...}"
	default:
		return fmt.Sprintf("%T", expr)
	}
}
