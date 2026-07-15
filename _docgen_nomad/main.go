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
	rootDir := `d:\claude\nomad\nomad`

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
		PackageName: "nomad",
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

	fileURI := "file:///d:/claude/nomad/nomad/" + info.RelPath

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
		"Apply": true, "Wait": true, "Close": true, "Snapshot": true,
		"Restore": true, "Fingerprint": true, "Evaluate": true, "Reap": true,
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
		testURI := "file:///d:/claude/nomad/nomad/" + filepath.ToSlash(strings.TrimPrefix(testPath, rootDir+string(filepath.Separator)))
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
	for _, suffix := range []string{"_linux", "_bsd", "_windows", "_darwin", "_default", "_unix", "_freebsd", "_ce"} {
		cleanBase = strings.TrimSuffix(cleanBase, suffix)
	}

	// Categorize by directory
	if dirName == "" {
		// Root nomad/ directory - categorize by filename
		return categorizeRootFile(cleanBase, baseName)
	}

	// Subdirectory categorization
	dirCategories := map[string]string{
		"auth":              "该文件属于 **认证子包**（`nomad/auth`），实现 Nomad Server 的 ACL 认证中间件，验证请求的访问令牌和权限。",
		"deploymentwatcher": "该文件属于 **部署监视器子包**（`nomad/deploymentwatcher`），监视部署状态变化，触发部署自动提升（promote）、回滚（rollback）等操作，协调部署的渐进式更新。",
		"drainer":           "该文件属于 **节点排水子包**（`nomad/drainer`），实现节点排水（drain）逻辑，优雅迁移节点上的分配到其他节点，包括排水堆调度、作业监视、节点监视等。",
		"lock":              "该文件属于 **分布式锁子包**（`nomad/lock`），基于 Raft 实现分布式锁，支持 TTL 和延迟锁定，用于 Nomad 集群内的互斥操作。",
		"mock":              "该文件属于 **模拟子包**（`nomad/mock`），提供测试用的模拟数据生成器，用于生成 Job、Node、Alloc 等对象的测试实例。",
		"peers":             "该文件属于 **对等节点子包**（`nomad/peers`），管理 Raft 集群的对等节点信息，持久化 peer 列表到本地存储。",
		"reporting":         "该文件属于 **报告子包**（`nomad/reporting`），实现 Nomad 企业版的报告生成功能（社区版存根）。",
		"state":             "该文件属于 **状态存储子包**（`nomad/state`），实现 Nomad Server 的状态存储（基于 MemDB），管理所有集群状态的内存索引和快照恢复。是 Raft FSM 的数据后端。",
		"state/indexer":     "该文件属于 **状态索引子包**（`nomad/state/indexer`），实现状态存储的二级索引，支持按时间等字段高效查询。",
		"state/paginator":   "该文件属于 **状态分页子包**（`nomad/state/paginator`），实现状态存储查询结果的分页和过滤，支持 token 化分页迭代。",
		"stream":            "该文件属于 **事件流子包**（`nomad/stream`），实现 Nomad Server 的事件订阅和推送机制，通过 Event Broker 和 Subscription 将集群状态变更实时推送到客户端。",
		"structs":           "该文件属于 **核心数据结构子包**（`nomad/structs`），定义 Nomad 的所有核心数据结构（Job、Node、Alloc、Eval、Deployment 等），是整个系统的领域模型基础。",
		"structs/config":    "该文件属于 **配置结构子包**（`nomad/structs/config`），定义 Nomad 的配置数据结构（Consul、Vault、TLS、Audit、Sentinel 等），支持 HCL 解析和默认值。",
		"volumewatcher":     "该文件属于 **卷监视器子包**（`nomad/volumewatcher`），监视 CSI 卷的 CLAIM/RELEASE 状态变化，触发卷的挂载/卸载操作，协调卷的分配和回收。",
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

	return fmt.Sprintf("该文件属于 Nomad Server 包的 `%s` 子包，提供 Server 运行所需的辅助功能。\n", dirName)
}

func categorizeRootFile(cleanBase, baseName string) string {
	// Categorize root-level files by name pattern
	switch cleanBase {
	case "server":
		return "该文件是 **Nomad Server 核心实现**，定义 `Server` 结构体——Nomad 集群的核心控制器。负责 Raft 共识、RPC 服务、调度协调、状态管理等核心功能的统一管理。是 Server 节点的中央调度器，管理所有子系统的生命周期。\n"
	case "fsm":
		return "该文件实现 **Raft 有限状态机（FSM）**，将 Raft 日志条目应用到状态存储（StateStore）。是 Raft 共识层与状态存储之间的桥梁，负责状态的快照和恢复。\n"
	case "leader":
		return "该文件实现 **Leader 选举后的初始化逻辑**，当 Server 成为 Raft Leader 时执行leader 选举后的设置工作，包括评估队列恢复、部署监视器启动、周期性调度器启动等。\n"
	case "config":
		return "该文件定义 **Server 运行时配置**，包括 Raft、Serf、RPC、调度器等配置参数，支持从文件和环境变量加载。\n"
	case "rpc":
		return "该文件实现 **Server RPC 层**，处理来自 Client 和 CLI 的 RPC 请求，包括请求路由、TLS 包装、RPC 速率限制等。\n"
	case "raft_rpc":
		return "该文件实现 **Raft RPC 传输层**，基于 Raft Library 的 Layer 接口，通过 Nomad 的 RPC 层传输 Raft 消息（AppendEntries、RequestVote 等）。\n"
	case "serf":
		return "该文件实现 **Serf 成员管理**，管理 Nomad Server 集群的成员发现和故障检测，基于 Serf gossip 协议。\n"
	case "encrypter":
		return "该文件实现 **加密器**，管理 Nomad 集群的加密密钥，用于 Raft 传输加密和状态加密。\n"
	case "worker":
		return "该文件实现 **调度工作器（Worker）**，从评估队列获取待处理评估，调用调度器处理，将结果写回状态存储。是调度循环的执行单元。\n"
	case "core_sched":
		return "该文件实现 **核心调度器**，处理系统级评估（如垃圾回收、节点排水），周期性清理过期对象。\n"
	case "eval_broker":
		return "该文件实现 **评估队列代理（EvalBroker）**，管理待处理评估的分发和确认，支持优先级和公平调度。是调度器的工作队列。\n"
	case "blocked_evals":
		return "该文件实现 **阻塞评估管理器**，管理因资源不足而阻塞的评估，在节点资源变化时重新调度。\n"
	case "blocked_evals_stats":
		return "该文件实现 **阻塞评估统计**，收集和报告阻塞评估的统计信息。\n"
	case "blocked_evals_system":
		return "该文件实现 **系统作业阻塞评估**，处理系统作业的阻塞评估特殊逻辑。\n"
	case "plan_apply":
		return "该文件实现 **计划应用器（PlanApplier）**，将调度器产生的计划（Plan）应用到状态存储，包括冲突检测、资源分配、原子提交。\n"
	case "plan_queue":
		return "该文件实现 **计划队列**，管理调度计划的提交和评估，协调调度器与计划应用器之间的工作流。\n"
	case "plan_endpoint":
		return "该文件实现 **计划 RPC 端点**，处理调度器提交计划的 RPC 请求。\n"
	case "plan_apply_node_tracker":
		return "该文件实现 **计划应用节点追踪器**，追踪计划应用过程中节点状态的变化，防止并发冲突。\n"
	case "plan_apply_pool":
		return "该文件实现 **计划应用连接池**，管理计划应用过程的资源池化。\n"
	case "job_endpoint":
		return "该文件实现 **作业 RPC 端点**，处理作业的 CRUD 操作（注册、查询、停止、调度等），是 Nomad API 的核心端点之一。包含作业验证、钩子链、状态查询等功能。\n"
	case "job_endpoint_hooks":
		return "该文件实现 **作业端点钩子链**，在作业注册时执行预处理器（如服务身份注入、Consul 配置注入、Vault 策略注入等），修改作业规格后持久化。\n"
	case "job_endpoint_hook_connect":
		return "该文件实现 **Consul Connect 作业钩子**，为作业注入 Consul Connect（服务网格）相关的服务身份和代理配置。\n"
	case "job_endpoint_hook_consul":
		return "该文件实现 **Consul 作业钩子**，为作业注入 Consul 服务发现配置和 ACL 令牌。\n"
	case "job_endpoint_hook_vault":
		return "该文件实现 **Vault 作业钩子**，为作业注入 Vault 密钥策略和 Token 角色。\n"
	case "job_endpoint_hook_expose_check":
		return "该文件实现 **暴露检查作业钩子**，验证 Consul Connect 服务的暴露路径配置。\n"
	case "job_endpoint_hook_implicit_identities":
		return "该文件实现 **隐式身份作业钩子**，为作业注入隐式的工作负载身份令牌。\n"
	case "job_endpoint_hook_node_pool":
		return "该文件实现 **节点池作业钩子**，根据作业的节点池约束修改作业调度属性。\n"
	case "job_endpoint_hook_numa":
		return "该文件实现 **NUMA 作业钩子**，根据 NUMA 拓扑优化作业调度。\n"
	case "job_endpoint_hook_sched":
		return "该文件实现 **调度器作业钩子**，根据调度器配置调整作业调度参数。\n"
	case "job_endpoint_validators":
		return "该文件实现 **作业验证器**，验证作业规格的合法性（资源、网络、设备等约束）。\n"
	case "job_endpoint_statuses":
		return "该文件实现 **作业状态查询**，提供作业及其分配、评估、部署的聚合状态视图。\n"
	case "node_endpoint":
		return "该文件实现 **节点 RPC 端点**，处理节点的注册、查询、排水、评估等操作。\n"
	case "alloc_endpoint":
		return "该文件实现 **分配 RPC 端点**，处理分配的查询、停止、重启、信号等操作。\n"
	case "client_alloc_endpoint":
		return "该文件实现 **客户端分配 RPC 端点**，处理 Client 发起的分配状态更新 RPC 请求。\n"
	case "client_agent_endpoint":
		return "该文件实现 **客户端代理 RPC 端点**，处理 Client 代理的注册、心跳、属性更新等 RPC 请求。\n"
	case "client_csi_endpoint":
		return "该文件实现 **客户端 CSI RPC 端点**，处理 Client 发起的 CSI 卷操作 RPC 请求。\n"
	case "client_fs_endpoint":
		return "该文件实现 **客户端文件系统 RPC 端点**，处理 Client 上的分配文件系统操作（读取、列出、统计等）。\n"
	case "client_host_volume_endpoint":
		return "该文件实现 **客户端主机卷 RPC 端点**，处理 Client 上的主机卷创建/删除 RPC 请求。\n"
	case "client_identity_endpoint":
		return "该文件实现 **客户端身份 RPC 端点**，处理 Client 发起的工作负载身份令牌请求。\n"
	case "client_meta_endpoint":
		return "该文件实现 **客户端元数据 RPC 端点**，处理 Client 的节点元数据读写 RPC 请求。\n"
	case "client_rpc":
		return "该文件实现 **客户端 RPC 路由**，将 Client 发起的 RPC 请求路由到对应的处理端点。\n"
	case "client_stats_endpoint":
		return "该文件实现 **客户端统计 RPC 端点**，处理 Client 节点资源使用统计查询 RPC 请求。\n"
	case "acl_endpoint":
		return "该文件实现 **ACL RPC 端点**，处理 ACL 策略、令牌、角色、绑定规则的 CRUD 操作。\n"
	case "acl":
		return "该文件实现 **ACL 管理器**，提供 ACL 令牌验证、策略解析、权限检查等核心 ACL 功能。\n"
	case "csi_endpoint":
		return "该文件实现 **CSI RPC 端点**，处理 CSI（容器存储接口）卷、插件的 CRUD 操作和生命周期管理。\n"
	case "deployment_endpoint":
		return "该文件实现 **部署 RPC 端点**，处理部署的查询、提升（promote）、回滚（rollback）、暂停（pause）等操作。\n"
	case "eval_endpoint":
		return "该文件实现 **评估 RPC 端点**，处理评估的查询、确认、重新调度等操作。\n"
	case "event_endpoint":
		return "该文件实现 **事件 RPC 端点**，处理事件流的订阅和推送 RPC 请求。\n"
	case "host_volume_endpoint":
		return "该文件实现 **主机卷 RPC 端点**，处理主机卷的 CRUD 操作和生命周期管理。\n"
	case "keyring_endpoint":
		return "该文件实现 **密钥环 RPC 端点**，处理集群加密密钥的添加、删除、轮转等操作。\n"
	case "namespace_endpoint":
		return "该文件实现 **命名空间 RPC 端点**，处理命名空间的 CRUD 操作。\n"
	case "node_pool_endpoint":
		return "该文件实现 **节点池 RPC 端点**，处理节点池的 CRUD 操作和节点分配。\n"
	case "operator_endpoint":
		return "该文件实现 **运维 RPC 端点**，处理集群运维操作（Raft 配置、快照、自动纠偏、调度器暂停等）。\n"
	case "periodic":
		return "该文件实现 **周期性调度器**，管理周期性作业的定时触发和派发，追踪已派发的作业实例。\n"
	case "periodic_endpoint":
		return "该文件实现 **周期性作业 RPC 端点**，处理周期性作业的手动触发等 RPC 请求。\n"
	case "scaling_endpoint":
		return "该文件实现 **自动伸缩 RPC 端点**，处理作业任务组的伸缩操作。\n"
	case "search_endpoint":
		return "该文件实现 **搜索 RPC 端点**，处理模糊搜索作业、节点、分配等资源的 RPC 请求。\n"
	case "service_registration_endpoint":
		return "该文件实现 **服务注册 RPC 端点**，处理 Nomad 内置服务注册的 CRUD 操作。\n"
	case "status_endpoint":
		return "该文件实现 **状态 RPC 端点**，处理集群和 Leader 状态查询 RPC 请求。\n"
	case "system_endpoint":
		return "该文件实现 **系统作业 RPC 端点**，处理系统作业的重新调度等操作。\n"
	case "variables_endpoint":
		return "该文件实现 **变量 RPC 端点**，处理键值对变量的 CRUD 操作，支持 CAS（乐观锁）。\n"
	case "regions_endpoint":
		return "该文件实现 **区域 RPC 端点**，处理跨区域集群信息查询 RPC 请求。\n"
	case "heartbeat":
		return "该文件实现 **心跳管理器**，管理 Client 节点的心跳，检测节点存活状态，超时触发节点标记为 down。\n"
	case "locks":
		return "该文件实现 **锁管理器**，管理分布式锁的启用/禁用和状态查询。\n"
	case "merge":
		return "该文件实现 **作业合并器**，实现多区域作业的合并逻辑，用于多区域调度。\n"
	case "stats_fetcher":
		return "该文件实现 **统计获取器**，从集群节点收集资源使用统计信息。\n"
	case "util":
		return "该文件提供 **Server 工具函数**，包括日志记录、错误处理等通用辅助功能。\n"
	case "testing":
		return "该文件提供 **Server 测试工具**，包括测试服务器创建、模拟数据生成等测试辅助功能。\n"
	case "autopilot":
		return "该文件实现 **自动纠偏（Autopilot）**，管理集群的自动健康检查、Leader 转移、服务器淘汰等功能。\n"
	case "consul":
		return "该文件实现 **Consul 集成**，管理 Nomad Server 与 Consul 的交互（服务发现、ACL 等）。\n"
	case "rpc_rate_metrics":
		return "该文件实现 **RPC 速率指标**，收集和报告 RPC 请求的速率指标。\n"
	case "task_group_host_volume_claim_endpoint":
		return "该文件实现 **任务组主机卷声明 RPC 端点**，处理任务组主机卷声明的 CRUD 操作。\n"
	case "deployment_watcher_shims":
		return "该文件提供 **部署监视器适配层**，为部署监视器提供 Server 接口的适配实现。\n"
	case "drainer_shims":
		return "该文件提供 **节点排水适配层**，为节点排水器提供 Server 接口的适配实现。\n"
	case "license_config":
		return "该文件定义 **许可证配置**，管理 Nomad 企业版的许可证配置（社区版存根）。\n"
	case "worker_string_schedulerworkerstatus":
		return "该文件实现 **调度器工作器状态字符串**，定义调度器工作器状态的字符串表示。\n"
	case "worker_string_workerstatus":
		return "该文件实现 **工作器状态字符串**，定义工作器状态的字符串表示。\n"
	}

	// Check for _ce suffix (Community Edition stubs)
	if strings.HasSuffix(baseName, "_ce") {
		return "该文件是 **社区版（CE）存根实现**，为 Nomad 企业版功能提供社区版的空实现，通过 build tag 机制在编译时选择。\n"
	}

	// Check for endpoint pattern
	if strings.Contains(cleanBase, "endpoint") {
		return "该文件实现 **Nomad RPC 端点**，处理特定资源的 RPC 请求（查询、创建、更新、删除等）。\n"
	}

	// Check for hook pattern
	if strings.Contains(cleanBase, "hook") {
		return "该文件实现 **作业注册钩子**，在作业注册时执行预处理逻辑，修改作业规格后持久化。\n"
	}

	return "该文件属于 Nomad Server 核心包（`nomad`），提供 Server 节点运行所需的功能。\n"
}

func describePatterns(info FileInfo) string {
	var patterns []string

	// Check for Server field (sub-server pattern)
	for _, t := range info.Types {
		if t.Kind == "struct" && (strings.Contains(t.Fields, "server *Server") || strings.Contains(t.Fields, "srv *Server")) {
			patterns = append(patterns, "- **组合模式**：结构体嵌入 Server 引用，通过组合获取 Server 上下文")
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

	// Check for Raft pattern
	for _, imp := range info.Imports {
		if strings.Contains(imp, "raft") {
			patterns = append(patterns, "- **Raft 共识**：使用 HashiCorp Raft 库实现分布式共识，保证状态一致性")
			break
		}
	}

	// Check for RPC endpoint pattern
	hasRPC := false
	for _, t := range info.Types {
		if t.Kind == "struct" && (strings.HasSuffix(t.Name, "Endpoint") || strings.Contains(t.Fields, "srv *Server")) {
			hasRPC = true
			break
		}
	}
	if hasRPC {
		patterns = append(patterns, "- **RPC 端点模式**：定义 RPC 端点结构体，将 Server 引用注入端点，处理特定资源的 RPC 请求")
	}

	// Check for hook pattern
	for _, t := range info.Types {
		if t.Kind == "struct" && strings.Contains(t.Name, "Hook") {
			patterns = append(patterns, "- **钩子模式**：实现作业注册钩子接口，在作业注册时执行预处理逻辑")
			break
		}
	}

	// Check for scheduler pattern
	for _, t := range info.Types {
		if t.Kind == "struct" && strings.Contains(t.Name, "Scheduler") {
			patterns = append(patterns, "- **调度器模式**：实现调度器接口，从评估队列获取评估并产生调度计划")
			break
		}
	}

	// Check for state store pattern
	for _, imp := range info.Imports {
		if strings.Contains(imp, "memdb") {
			patterns = append(patterns, "- **内存数据库**：使用 MemDB 实现内存索引，支持事务和多版本并发控制（MVCC）")
			break
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

	// Check for streaming
	for _, f := range info.Functions {
		if strings.Contains(f.Returns, "stream") || strings.Contains(f.Params, "Stream") || strings.Contains(f.Returns, "<-chan") {
			patterns = append(patterns, "- **流式响应**：支持流式数据传输，用于事件订阅和长连接场景")
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

	// Check for CE/Enterprise
	if strings.HasSuffix(info.FileName, "_ce.go") {
		patterns = append(patterns, "- **社区版存根**：为企业版功能提供社区版的空实现，通过 build tag 选择")
	}

	// Check for protobuf/gRPC
	for _, imp := range info.Imports {
		if strings.Contains(imp, "grpc") || strings.Contains(imp, "protobuf") {
			patterns = append(patterns, "- **gRPC 通信**：使用 gRPC 进行进程间通信")
			break
		}
	}

	// Check for ACL
	for _, imp := range info.Imports {
		if strings.Contains(imp, "acl") {
			patterns = append(patterns, "- **ACL 集成**：集成访问控制列表，验证请求权限")
			break
		}
	}

	if len(patterns) == 0 {
		patterns = append(patterns, "- 遵循 Go 标准代码组织规范，作为 Nomad Server 的一部分")
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
