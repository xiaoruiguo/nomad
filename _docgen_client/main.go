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
	rootDir := `d:\claude\nomad\client`

	var files []string
	err := filepath.Walk(rootDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			return nil
		}
		name := info.Name()
		if !strings.HasSuffix(name, ".go") {
			return nil
		}
		if strings.HasSuffix(name, "_test.go") {
			return nil
		}
		// Skip generated files
		if strings.Contains(name, "generated") || strings.Contains(name, ".pb.go") {
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
		PackageName: "client",
		LineCount:   lineCount,
	}

	// Detect platform-specific
	baseName := strings.TrimSuffix(name, ".go")
	platformSuffixes := map[string]string{
		"_linux":   "Linux",
		"_bsd":     "BSD",
		"_windows": "Windows",
		"_darwin":  "macOS",
		"_default": "默认/其他平台",
		"_unix":    "Unix-like",
		"_freebsd": "FreeBSD",
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

	fileURI := "file:///d:/claude/nomad/client/" + info.RelPath

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
		"Parse": true, "Validate": true, "Plan": true, "Scale": true,
		"Allocations": true, "Evaluations": true, "Deployments": true,
		"Submit": true, "Dispatch": true, "Revert": true, "Stable": true,
		"ForceEvaluate": true, "Versions": true, "Summary": true,
		"ForcePeriodicRun": true, "Restart": true, "Signal": true, "Stop": true,
		"Run": true, "Init": true, "Start": true, "Shutdown": true,
		"Fingerprint": true, "Apply": true, "Wait": true, "Close": true,
	}
	detailedCount := 0
	for _, f := range info.Functions {
		if !f.IsExported || detailedCount >= 8 {
			continue
		}
		if keyMethods[f.Name] || (strings.HasPrefix(f.Name, "List") || strings.HasPrefix(f.Name, "Get")) {
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
		testURI := "file:///d:/claude/nomad/client/" + filepath.ToSlash(strings.TrimPrefix(testPath, rootDir+string(filepath.Separator)))
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

	// Remove platform suffix for categorization
	cleanBase := baseName
	for _, suffix := range []string{"_linux", "_bsd", "_windows", "_darwin", "_default", "_unix", "_freebsd"} {
		cleanBase = strings.TrimSuffix(cleanBase, suffix)
	}

	// Categorize by directory
	if dirName == "" {
		// Root client/ directory
		switch cleanBase {
		case "client":
			return "该文件是 **Nomad Client 核心实现**，定义 `Client` 结构体——Client 节点的主控对象。负责分配运行（AllocRunner）、指纹采集（Fingerprinting）、设备管理、服务注册、状态持久化等核心功能的协调。是 Client 节点的中央调度器，管理所有子系统的生命周期。\n"
		case "config":
			return "该文件定义 **Client 配置接口和默认实现**，提供 Client 节点的运行时配置（节点属性、驱动配置、端口映射等）。\n"
		case "idset":
			return "该文件提供 **ID 集合工具**，用于管理一组标识符的集合操作。\n"
		case "meta":
			return "该文件定义 **Client 元数据**，提供节点元数据的存储和访问。\n"
		case "rpc":
			return "该文件实现 **Client RPC 服务**，处理来自 Server 的 RPC 请求（如分配状态查询、统计收集等）。\n"
		case "stats":
			return "该文件实现 **Client 统计收集**，收集和报告 Client 节点的运行时统计信息。\n"
		}
		return "该文件属于 Nomad Client 核心包（`client`），提供 Client 节点运行所需的功能。\n"
	}

	// Subdirectory categorization
	dirCategories := map[string]string{
		"allocdir":                       "该文件属于 **分配目录管理子包**（`client/allocdir`），管理分配的文件系统目录（共享目录、任务目录、日志目录等），为任务提供隔离的文件系统环境。",
		"allocdir/input":                 "该文件属于 **分配目录输入子包**（`client/allocdir/input`），处理分配的输入数据流。",
		"allochealth":                    "该文件属于 **分配健康检查子包**（`client/allochealth`），实现分配的健康状态监控和报告。",
		"allocrunner":                    "该文件属于 **分配运行器子包**（`client/allocrunner`），实现分配（Allocation）的运行生命周期管理，包括预启动钩子、网络配置、Consul 集成、CSI 卷挂载、健康检查等。AllocRunner 是 Client 节点上每个分配的控制器。",
		"allocrunner/cni":                "该文件属于 **CNI 网络子包**（`client/allocrunner/cni`），实现 CNI（容器网络接口）插件调用，为分配配置网络命名空间。",
		"allocrunner/hookstats":          "该文件属于 **钩子统计子包**（`client/allocrunner/hookstats`），收集分配运行器钩子的执行统计信息。",
		"allocrunner/interfaces":         "该文件属于 **分配运行器接口子包**（`client/allocrunner/interfaces`），定义分配运行器各组件的接口契约。",
		"allocrunner/state":              "该文件属于 **分配运行器状态子包**（`client/allocrunner/state`），定义分配运行器的状态数据结构。",
		"allocrunner/tasklifecycle":      "该文件属于 **任务生命周期子包**（`client/allocrunner/tasklifecycle`），管理任务的状态转换（pending→running→dead 等）和生命周期事件。",
		"allocrunner/taskrunner":         "该文件属于 **任务运行器子包**（`client/allocrunner/taskrunner`），实现单个任务的运行生命周期管理，包括任务启动/停止、 artifact 下载、模板渲染、密钥注入、重启策略等。TaskRunner 是分配内每个任务的控制器。",
		"allocrunner/taskrunner/errors":  "该文件属于 **任务运行器错误子包**（`client/allocrunner/taskrunner/errors`），定义任务运行相关的错误类型。",
		"allocrunner/taskrunner/getter":  "该文件属于 **Artifact 下载子包**（`client/allocrunner/taskrunner/getter`），实现任务 artifact 的下载和校验功能。",
		"allocrunner/taskrunner/interfaces": "该文件属于 **任务运行器接口子包**（`client/allocrunner/taskrunner/interfaces`），定义任务运行器各组件的接口契约。",
		"allocrunner/taskrunner/restarts": "该文件属于 **任务重启子包**（`client/allocrunner/taskrunner/restarts`），实现任务重启策略的计算和跟踪。",
		"allocrunner/taskrunner/secrets": "该文件属于 **密钥管理子包**（`client/allocrunner/taskrunner/secrets`），实现任务密钥（Vault Token 等）的获取和注入。",
		"allocrunner/taskrunner/state":   "该文件属于 **任务运行器状态子包**（`client/allocrunner/taskrunner/state`），定义任务运行器的状态数据结构。",
		"allocrunner/taskrunner/template": "该文件属于 **模板渲染子包**（`client/allocrunner/taskrunner/template`），实现 Consul-Template 风格的配置模板渲染。",
		"allocrunner/taskrunner/template/renderer": "该文件属于 **模板渲染器子包**（`client/allocrunner/taskrunner/template/renderer`），实现模板的底层渲染引擎。",
		"allocrunner/taskrunner/testing": "该文件属于 **任务运行器测试工具子包**（`client/allocrunner/taskrunner/testing`），提供任务运行器的测试辅助工具。",
		"allocwatcher":                   "该文件属于 **分配监视器子包**（`client/allocwatcher`），监视分配的迁移和更新，协调新旧分配的平滑过渡。",
		"commonplugins":                  "该文件属于 **通用插件子包**（`client/commonplugins`），提供 Client 节点常用的内置插件。",
		"config":                         "该文件属于 **Client 配置子包**（`client/config`），定义 Client 节点的配置结构和默认值。",
		"consul":                         "该文件属于 **Consul 集成子包**（`client/consul`），提供 Consul API 的适配层。",
		"devicemanager":                  "该文件属于 **设备管理器子包**（`client/devicemanager`），管理 GPU、FPGA 等硬件设备的发现、分配和统计。",
		"devicemanager/state":            "该文件属于 **设备管理器状态子包**（`client/devicemanager/state`），定义设备管理器的状态数据结构。",
		"dynamicplugins":                 "该文件属于 **动态插件子包**（`client/dynamicplugins`），管理运行时动态注册的插件。",
		"fingerprint":                    "该文件属于 **指纹采集子包**（`client/fingerprint`），实现节点能力检测（CPU、内存、网络、存储、Arch、Consul、Vault 等），向 Server 报告节点资源。是调度器决策的基础。",
		"hoststats":                      "该文件属于 **主机统计子包**（`client/hoststats`），收集和报告主机级别的资源使用统计（CPU、内存、磁盘、网络）。",
		"hostvolumemanager":              "该文件属于 **主机卷管理器子包**（`client/hostvolumemanager`），管理主机卷的创建、删除和挂载操作。",
		"interfaces":                     "该文件属于 **Client 接口子包**（`client/interfaces`），定义 Client 对外暴露的接口契约。",
		"lib/cgroupslib":                 "该文件属于 **cgroups 库子包**（`client/lib/cgroupslib`），封装 Linux cgroups 操作，用于资源限制和隔离。",
		"lib/cpustats":                   "该文件属于 **CPU 统计子包**（`client/lib/cpustats`），收集和计算 CPU 使用率统计。",
		"lib/fifo":                       "该文件属于 **FIFO 子包**（`client/lib/fifo`），提供 FIFO（命名管道）操作工具。",
		"lib/idset":                      "该文件属于 **ID 集合子包**（`client/lib/idset`），提供 ID 集合的通用工具。",
		"lib/nsutil":                     "该文件属于 **命名空间工具子包**（`client/lib/nsutil`），提供 Linux 命名空间操作工具。",
		"lib/numalib":                    "该文件属于 **NUMA 库子包**（`client/lib/numalib`），处理 NUMA（非统一内存访问）拓扑和 CPU 绑定。",
		"lib/numalib/hw":                 "该文件属于 **NUMA 硬件子包**（`client/lib/numalib/hw`），与硬件层交互获取 NUMA 拓扑信息。",
		"lib/proclib":                    "该文件属于 **进程库子包**（`client/lib/proclib`），提供进程操作工具。",
		"lib/streamframer":               "该文件属于 **流帧子包**（`client/lib/streamframer`），实现日志流的帧编码/解码。",
		"logmon":                         "该文件属于 **日志监控子包**（`client/logmon`），监控任务的日志输出并进行轮转。",
		"logmon/logging":                 "该文件属于 **日志记录子包**（`client/logmon/logging`），提供日志记录辅助功能。",
		"logmon/proto":                   "该文件属于 **日志监控协议子包**（`client/logmon/proto`），定义日志监控的 gRPC 协议。",
		"pluginmanager":                  "该文件属于 **插件管理器子包**（`client/pluginmanager`），管理 Nomad 插件（驱动、CSI 等）的生命周期。",
		"pluginmanager/csimanager":       "该文件属于 **CSI 插件管理器子包**（`client/pluginmanager/csimanager`），管理 CSI（容器存储接口）插件的注册和健康监控。",
		"pluginmanager/drivermanager":    "该文件属于 **驱动插件管理器子包**（`client/pluginmanager/drivermanager`），管理任务驱动插件（docker、exec 等）的注册和健康监控。",
		"pluginmanager/drivermanager/state": "该文件属于 **驱动管理器状态子包**（`client/pluginmanager/drivermanager/state`），定义驱动管理器的状态数据结构。",
		"servers":                        "该文件属于 **服务器管理子包**（`client/servers`），管理 Client 连接的 Server 列表和故障转移。",
		"serviceregistration":            "该文件属于 **服务注册子包**（`client/serviceregistration`），管理任务服务的注册和注销（Consul/Nomad 内置）。",
		"serviceregistration/checks":     "该文件属于 **服务检查子包**（`client/serviceregistration/checks`），管理服务健康检查的定义和执行。",
		"serviceregistration/checks/checkstore": "该文件属于 **检查存储子包**（`client/serviceregistration/checks/checkstore`），存储服务检查的当前状态。",
		"serviceregistration/mock":       "该文件属于 **服务注册模拟子包**（`client/serviceregistration/mock`），提供测试用的模拟服务注册器。",
		"serviceregistration/nsd":        "该文件属于 **Nomad 服务发现子包**（`client/serviceregistration/nsd`），实现 Nomad 内置的服务发现机制。",
		"serviceregistration/wrapper":    "该文件属于 **服务注册包装器子包**（`client/serviceregistration/wrapper`），包装服务注册器，提供统一接口。",
		"state":                          "该文件属于 **Client 状态子包**（`client/state`），使用 BoltDB 持久化 Client 的本地状态（分配、任务状态等）。",
		"structs":                        "该文件属于 **Client 结构体子包**（`client/structs`），定义 Client 层的数据结构（事件、统计、响应等）。",
		"taskenv":                        "该文件属于 **任务环境子包**（`client/taskenv`），构建任务的环境变量（节点属性、元数据、服务发现等）。",
		"testutil":                       "该文件属于 **测试工具子包**（`client/testutil`），提供 Client 测试的辅助工具（模拟 Client、测试服务器等）。",
		"vaultclient":                    "该文件属于 **Vault 客户端子包**（`client/vaultclient`），封装 Vault API 交互，为任务获取 Vault Token。",
		"widmgr":                         "该文件属于 **工作负载身份管理器子包**（`client/widmgr`），管理工作负载身份（Workload Identity）令牌的生成和续约。",
	}

	if desc, ok := dirCategories[dirName]; ok {
		return desc + "\n"
	}

	// Fallback: try parent directory
	parts := strings.Split(dirName, "/")
	for i := len(parts) - 1; i > 0; i-- {
		parentDir := strings.Join(parts[:i], "/")
		if desc, ok := dirCategories[parentDir]; ok {
			return desc + "\n"
		}
	}

	return fmt.Sprintf("该文件属于 Nomad Client 包的 `%s` 子包，提供 Client 节点运行所需的辅助功能。\n", dirName)
}

func describePatterns(info FileInfo) string {
	var patterns []string

	// Check for Client field (sub-client pattern)
	for _, t := range info.Types {
		if t.Kind == "struct" && (strings.Contains(t.Fields, "client *Client") || strings.Contains(t.Fields, "alloc *AllocRunner") || strings.Contains(t.Fields, "task *TaskRunner")) {
			patterns = append(patterns, "- **组合模式**：结构体嵌入主控对象引用（Client/AllocRunner/TaskRunner），通过组合获取上下文")
			break
		}
	}

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

	// Check for hook pattern (allocrunner)
	if strings.Contains(info.DirName, "allocrunner") {
		for _, t := range info.Types {
			if t.Kind == "struct" && (strings.Contains(t.Name, "Hook") || strings.Contains(t.Fields, "prestartHook") || strings.Contains(t.Fields, "preKillHook")) {
				patterns = append(patterns, "- **钩子模式**：实现 AllocRunner/TaskRunner 的生命周期钩子接口，在分配/任务状态转换时执行自定义逻辑")
				break
			}
		}
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

	// Check for streaming (io.Reader/chan)
	for _, f := range info.Functions {
		if strings.Contains(f.Returns, "io.ReadCloser") || strings.Contains(f.Returns, "<-chan") {
			patterns = append(patterns, "- **流式响应**：返回 `io.ReadCloser` 或 channel，支持流式数据读取")
			break
		}
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

	// Check for struct tags (json/hcl)
	for _, t := range info.Types {
		if strings.Contains(t.Fields, "json:") || strings.Contains(t.Fields, "hcl:") {
			patterns = append(patterns, "- **结构标签**：使用 `json`/`hcl` 结构标签支持序列化和配置解析")
			break
		}
	}

	// Check for logger
	for _, imp := range info.Imports {
		if strings.Contains(imp, "hclog") || strings.Contains(imp, "log") {
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

	// Check for gRPC
	for _, imp := range info.Imports {
		if strings.Contains(imp, "grpc") || strings.Contains(imp, "protobuf") {
			patterns = append(patterns, "- **gRPC 通信**：使用 gRPC 进行进程间通信")
			break
		}
	}

	// Check for plugin pattern
	for _, imp := range info.Imports {
		if strings.Contains(imp, "hashicorp/go-plugin") {
			patterns = append(patterns, "- **插件架构**：使用 `go-plugin` 框架实现插件化扩展")
			break
		}
	}

	if len(patterns) == 0 {
		patterns = append(patterns, "- 遵循 Go 标准代码组织规范，作为 Nomad Client 的一部分")
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
