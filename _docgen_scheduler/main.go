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
	rootDir := `d:\claude\nomad\scheduler`

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
		if count%10 == 0 {
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
		PackageName: "scheduler",
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

	fileURI := "file:///d:/claude/nomad/scheduler/" + info.RelPath

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
		"Process": true, "Submit": true, "Dispatch": true, "Revert": true,
		"Run": true, "Init": true, "Start": true, "Shutdown": true,
		"Apply": true, "Wait": true, "Close": true, "Snapshot": true,
		"Restore": true, "Compute": true, "Reconcile": true, "Select": true,
		"Next": true, "Reset": true, "Feasible": true, "Score": true,
		"Annotate": true, "Preempt": true, "Stop": true,
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
		testURI := "file:///d:/claude/nomad/scheduler/" + filepath.ToSlash(strings.TrimPrefix(testPath, rootDir+string(filepath.Separator)))
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

	// Categorize by subdirectory first
	dirCategories := map[string]string{
		"feasible":   "该文件属于 **可行性检查子包**（`scheduler/feasible`），实现调度器的可行性检查和评分迭代器栈。包含节点过滤（约束、驱动、设备、网络）、评分（装箱、分散、资源利用率）、抢占、排名等核心调度算法。是调度决策的核心引擎，采用迭代器链模式（Iterator Chain）实现可组合的调度管道。",
		"reconciler": "该文件属于 **协调器子包**（`scheduler/reconciler`），实现服务/批处理作业的状态协调逻辑。比较现有分配状态与期望状态的差异，计算需要创建、更新、停止、迁移的分配集合。是 GenericScheduler 的第一阶段，将期望状态转换为具体的放置计划。",
		"structs":    "该文件属于 **调度器结构体子包**（`scheduler/structs`），定义调度器层的核心接口和数据结构：Scheduler 接口、State 状态视图接口、Planner 计划提交接口、Plan 计划构建器等。是调度器与 Nomad Server 状态存储之间的抽象层。",
		"tests":      "该文件属于 **调度器测试工具子包**（`scheduler/tests`），提供调度器测试用的测试框架和辅助工具，包括测试 Harness、模拟 Planner、模拟 State 等。",
	}

	if desc, ok := dirCategories[dirName]; ok {
		return desc + "\n"
	}

	// Root scheduler/ directory - categorize by filename
	if dirName == "" {
		return categorizeRootFile(cleanBase, baseName)
	}

	return fmt.Sprintf("该文件属于 Nomad 调度器包的 `%s` 子包，提供调度相关功能。\n", dirName)
}

func categorizeRootFile(cleanBase, baseName string) string {
	switch cleanBase {
	case "scheduler":
		return "该文件是 **调度器核心入口**，定义 `Scheduler` 接口、`Factory` 工厂函数和 `BuiltinSchedulers` 注册表。提供服务（service）、批处理（batch）、系统（system）、系统批处理（sysbatch）四种内置调度器的工厂函数，是整个调度器子系统的入口点。\n"
	case "generic_sched":
		return "该文件实现 **通用调度器（GenericScheduler）**，用于 service 和 batch 类型作业。是 Nomad 的主要调度器，处理长期运行的服务和批处理任务。采用两阶段调度：先通过 reconciler 计算期望状态差异，再通过 feasible 迭代器栈选择节点。支持部署、回滚、重调度、抢占等复杂场景。\n"
	case "scheduler_system":
		return "该文件实现 **系统调度器（SystemScheduler）**，用于 system 类型作业。将作业调度到所有符合条件的客户端节点上，确保每个节点运行一个实例。适用于基础设施类作业（如监控代理、日志收集器）。\n"
	case "scheduler_sysbatch":
		return "该文件实现 **系统批处理调度器（SysBatchScheduler）**，用于 sysbatch 类型作业。类似系统调度器，将作业调度到所有节点，但在任务成功完成后视为完成（不像 system 作业会持续运行）。适用于一次性运维任务。\n"
	case "annotate":
		return "该文件实现 **计划注解器**，为调度计划（Plan）的 diff 添加人类可读的注解，说明每个任务组的变更类型（创建、销毁、原地更新、破坏性更新等）。用于 `nomad job plan` 和 `nomad job inspect` 命令的输出展示。\n"
	case "util":
		return "该文件提供 **调度器工具函数**，包括节点过滤、就绪节点查询、数据中心匹配、抢占评估等通用辅助功能，被各调度器实现共享使用。\n"
	case "doc":
		return "该文件是 **调度器包文档**，提供调度器子系统的包级说明文档。\n"
	}

	// Check for _ce suffix (Community Edition stubs)
	if strings.HasSuffix(baseName, "_ce") {
		return "该文件是 **社区版（CE）存根实现**，为 Nomad 企业版调度器功能提供社区版的空实现，通过 build tag 机制在编译时选择。\n"
	}

	return "该文件属于 Nomad 调度器核心包（`scheduler`），提供调度器运行所需的功能。\n"
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

	// Check for Iterator pattern (feasible package)
	if info.DirName == "feasible" {
		hasIterator := false
		for _, t := range info.Types {
			if t.Kind == "struct" && strings.HasSuffix(t.Name, "Iterator") {
				hasIterator = true
				break
			}
		}
		if hasIterator {
			patterns = append(patterns, "- **迭代器链模式**：实现迭代器接口，通过组合形成可配置的调度管道，每个迭代器负责一个调度阶段（过滤、评分、限制等）")
		}
	}

	// Check for Stack pattern
	for _, t := range info.Types {
		if t.Kind == "struct" && strings.HasSuffix(t.Name, "Stack") {
			patterns = append(patterns, "- **调度栈模式**：实现 Stack 接口，组合多个迭代器形成完整的调度流水线")
			break
		}
	}

	// Check for Scheduler pattern
	for _, t := range info.Types {
		if t.Kind == "struct" && strings.HasSuffix(t.Name, "Scheduler") {
			patterns = append(patterns, "- **调度器模式**：实现 Scheduler 接口的 Process 方法，处理评估并产生调度计划")
			break
		}
	}

	// Check for Reconciler pattern
	for _, t := range info.Types {
		if t.Kind == "struct" && (strings.Contains(t.Name, "Reconciler") || strings.Contains(t.Name, "reconciler")) {
			patterns = append(patterns, "- **状态协调模式**：比较现有状态与期望状态的差异，计算最小变更集合")
			break
		}
	}

	// Check for Factory pattern
	for _, f := range info.Functions {
		if strings.HasPrefix(f.Name, "New") && strings.HasSuffix(f.Name, "Scheduler") {
			patterns = append(patterns, "- **工厂模式**：提供调度器工厂函数，通过名称创建不同类型的调度器实例")
			break
		}
	}

	// Check for memdb usage (state access)
	for _, imp := range info.Imports {
		if strings.Contains(imp, "memdb") {
			patterns = append(patterns, "- **MemDB 状态访问**：通过 MemDB 事务读取集群状态，支持多版本并发控制（MVCC）")
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
		if strings.Contains(imp, "hclog") || strings.Contains(imp, "go-hclog") {
			patterns = append(patterns, "- **结构化日志**：使用 `hclog` 进行结构化日志记录")
			break
		}
	}

	// Check for metrics
	for _, imp := range info.Imports {
		if strings.Contains(imp, "metrics") {
			patterns = append(patterns, "- **指标收集**：使用 `go-metrics` 收集调度器运行时指标（调度耗时、放置数量等）")
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

	// Check for preemption
	for _, t := range info.Types {
		if strings.Contains(t.Name, "Preempt") || strings.Contains(t.Name, "preempt") {
			patterns = append(patterns, "- **抢占调度**：实现抢占逻辑，通过停止低优先级分配为高优先级作业释放资源")
			break
		}
	}

	// Check for scoring/ranking
	for _, t := range info.Types {
		if strings.Contains(t.Name, "Rank") || strings.Contains(t.Name, "Score") {
			patterns = append(patterns, "- **评分排名**：实现节点评分和排名算法，基于装箱、资源利用率、分散性等指标选择最优节点")
			break
		}
	}

	// Check for testing utilities
	if info.DirName == "tests" {
		patterns = append(patterns, "- **测试工具**：提供调度器测试用的模拟对象和测试框架，便于编写单元测试")
	}

	if len(patterns) == 0 {
		patterns = append(patterns, "- 遵循 Go 标准代码组织规范，作为 Nomad 调度器的一部分")
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
