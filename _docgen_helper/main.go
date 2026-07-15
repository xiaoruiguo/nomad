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
	rootDir := `d:\claude\nomad\helper`

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
		PackageName: "helper",
		LineCount:   lineCount,
	}

	// Detect platform-specific
	baseName := strings.TrimSuffix(name, ".go")
	platformSuffixes := map[string]string{
		"_linux":     "Linux",
		"_bsd":       "BSD",
		"_windows":   "Windows",
		"_darwin":    "macOS",
		"_default":   "默认/其他平台",
		"_unix":      "Unix-like",
		"_freebsd":   "FreeBSD",
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

	fileURI := "file:///d:/claude/nomad/helper/" + info.RelPath

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
		"Catalog": true, "Generate": true,
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
		testURI := "file:///d:/claude/nomad/helper/" + filepath.ToSlash(strings.TrimPrefix(testPath, rootDir+string(filepath.Separator)))
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

	// Categorize by subdirectory first
	dirCategories := map[string]string{
		"args":                        "该文件属于 **命令行参数子包**（`helper/args`），提供命令行参数解析和处理工具。",
		"boltdd":                      "该文件属于 **BoltDB 数据目录子包**（`helper/boltdd`），封装 BoltDB 的数据目录操作，支持隔离的数据存储。",
		"broker":                      "该文件属于 **通知代理子包**（`helper/broker`），实现通用的发布-订阅消息代理，支持主题订阅和通知分发。",
		"bufconndialer":               "该文件属于 **缓冲连接拨号器子包**（`helper/bufconndialer`），实现缓冲连接的拨号器，用于内存中的网络连接模拟。",
		"codec":                       "该文件属于 **编解码器子包**（`helper/codec`），实现内存中的 RPC 编解码器，用于测试和内部通信。",
		"constraints/semver":          "该文件属于 **语义版本约束子包**（`helper/constraints/semver`），实现语义版本（SemVer）约束解析和匹配，支持版本范围检查。",
		"crypto":                      "该文件属于 **加密工具子包**（`helper/crypto`），提供加密和解密工具函数，支持密钥管理和数据加密。",
		"discover":                    "该文件属于 **插件发现子包**（`helper/discover`），实现 Nomad 插件的自动发现机制，扫描指定目录查找可用插件。",
		"envoy":                       "该文件属于 **Envoy 集成子包**（`helper/envoy`），提供 Envoy 代理的版本解析和配置辅助功能。",
		"escapingfs":                  "该文件属于 **文件系统逃逸防护子包**（`helper/escapingfs`），实现文件系统路径逃逸检测和防护，防止路径遍历攻击，确保文件操作限制在指定目录内。",
		"escapingio":                  "该文件属于 **IO 逃逸防护子包**（`helper/escapingio`），实现 IO 操作的逃逸防护，防止读取超出预期范围的数据。",
		"flags":                       "该文件属于 **命令行标志子包**（`helper/flags`），实现自定义命令行标志解析，支持 Autopilot 等配置标志。",
		"flatmap":                     "该文件属于 **扁平化映射子包**（`helper/flatmap`），实现嵌套 map 的扁平化处理，将层级结构转换为点分隔的键值对。",
		"gated-writer":                "该文件属于 **门控写入器子包**（`helper/gated-writer`），实现门控写入器，支持延迟写入和批量刷新，用于控制输出流。",
		"goruntime":                   "该文件属于 **Go 运行时子包**（`helper/goruntime`），提供 Go 运行时信息查询工具，获取 GOMAXPROCS 等运行时参数。",
		"group":                       "该文件属于 **协程组子包**（`helper/group`），实现协程组管理，支持协程的启动、等待和错误收集。",
		"grpc-middleware/logging":     "该文件属于 **gRPC 中间件日志子包**（`helper/grpc-middleware/logging`），实现 gRPC 客户端拦截器的日志记录中间件。",
		"hcl":                         "该文件属于 **HCL 解析子包**（`helper/hcl`），提供 HCL（HashiCorp 配置语言）的解析和解码工具函数。",
		"ipaddr":                      "该文件属于 **IP 地址工具子包**（`helper/ipaddr`），提供 IP 地址解析、格式化和验证工具函数。",
		"joseutil":                    "该文件属于 **JOSE 工具子包**（`helper/joseutil`），提供 JOSE（JSON 对象签名和加密）工具，用于 JWT 令牌的签名和验证。",
		"logging":                     "该文件属于 **日志工具子包**（`helper/logging`），提供日志配置和初始化工具函数，支持多种日志输出格式和级别。",
		"mount":                       "该文件属于 **挂载工具子包**（`helper/mount`），实现文件系统挂载信息查询，支持跨平台的挂载点检测。",
		"noxssrw":                     "该文件属于 **XSS 防护子包**（`helper/noxssrw`），实现 XSS（跨站脚本）防护的读写器，对输出内容进行转义处理。",
		"pluginutils/catalog":         "该文件属于 **插件目录子包**（`helper/pluginutils/catalog`），实现 Nomad 插件的目录管理，支持内部和外部插件的注册、查找和初始化。",
		"pluginutils/grpcutils":       "该文件属于 **gRPC 插件工具子包**（`helper/pluginutils/grpcutils`），提供 gRPC 插件通信的工具函数。",
		"pluginutils/hclspecutils":    "该文件属于 **HCL 规格工具子包**（`helper/pluginutils/hclspecutils`），提供 HCL 规格解析和类型表达式处理工具，用于插件配置验证。",
		"pluginutils/hclutils":        "该文件属于 **HCL 工具子包**（`helper/pluginutils/hclutils`），提供 HCL 相关的工具函数和类型定义，辅助插件配置处理。",
		"pluginutils/loader":          "该文件属于 **插件加载器子包**（`helper/pluginutils/loader`），实现 Nomad 插件的加载器，管理插件实例的生命周期，支持内部插件（编译内置）和外部插件（独立进程）的加载、配置和重新连接。",
		"pluginutils/singleton":       "该文件属于 **单例插件子包**（`helper/pluginutils/singleton`），实现单例模式的插件管理，确保插件实例的唯一性和延迟初始化。",
		"pointer":                     "该文件属于 **指针工具子包**（`helper/pointer`），提供泛型指针操作工具函数（如 Of、Value），简化指针的创建和解引用。",
		"pool":                        "该文件属于 **连接池子包**（`helper/pool`），实现 RPC 连接池，管理到 Nomad Server 的连接复用、超时和生命周期，支持 Yamux 多路复用。",
		"raftutil":                    "该文件属于 **Raft 工具子包**（`helper/raftutil`），提供 Raft 相关的工具函数，包括 FSM 快照管理、日志消息类型定义、状态迁移、快照归档等，用于 Raft 状态的离线检查和恢复。",
		"safemath":                    "该文件属于 **安全算术子包**（`helper/safemath`），实现整数运算的溢出检测和安全算术操作，防止整数溢出导致的错误。",
		"snapshot":                    "该文件属于 **快照工具子包**（`helper/snapshot`），实现 Nomad 集群快照的创建和恢复，管理 Raft 快照与 Nomad 状态的交互，支持压缩和校验。",
		"subproc":                     "该文件属于 **子进程子包**（`helper/subproc``），实现子进程管理框架，支持父子进程通信、退出码处理和优雅关闭，用于 Nomad 的 fork-exec 模式。",
		"testlog":                     "该文件属于 **测试日志子包**（`helper/testlog`），提供测试用的日志捕获和断言工具，便于在测试中验证日志输出。",
		"testtask":                    "该文件属于 **测试任务子包**（`helper/testtask`），提供测试用的任务模拟工具，用于集成测试中的任务执行模拟。",
		"tlsutil":                     "该文件属于 **TLS 工具子包**（`helper/tlsutil`），实现 TLS 配置和证书管理工具，支持证书生成、TLS 版本控制、密码套件配置和区域间 TLS 包装器。",
		"useragent":                   "该文件属于 **用户代理子包**（`helper/useragent`），生成 Nomad HTTP 客户端的 User-Agent 字符串，包含版本和平台信息。",
		"users":                       "该文件属于 **用户查找子包**（`helper/users`），实现系统用户查找（UID/GID 解析），支持缓存和跨平台兼容，用于任务执行的用户身份切换。",
		"users/dynamic":               "该文件属于 **动态用户池子包**（`helper/users/dynamic`），实现动态用户分配池，为任务分配和回收系统用户 ID，支持并发安全。",
		"uuid":                        "该文件属于 **UUID 工具子包**（`helper/uuid`），提供 UUID 生成工具函数，基于 crypto/rand 生成随机 UUID。",
		"winsvc":                      "该文件属于 **Windows 服务子包**（`helper/winsvc`），实现 Nomad 在 Windows 上的服务管理，包括服务安装、启动、停止、事件日志记录和权限提升，通过 build tag 区分 Windows 和非 Windows 平台。",
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

	// Root helper/ directory - categorize by filename
	if dirName == "" {
		return categorizeRootFile(cleanBase, baseName)
	}

	return fmt.Sprintf("该文件属于 Nomad 辅助工具包的 `%s` 子包，提供通用工具功能。\n", dirName)
}

func categorizeRootFile(cleanBase, baseName string) string {
	switch cleanBase {
	case "backoff":
		return "该文件实现 **退避重试工具**，提供几何退避（Geometric Backoff）算法，支持上下文取消和最大重试限制。用于网络请求、RPC 调用等场景的重试控制。\n"
	case "cluster":
		return "该文件实现 **集群工具函数**，提供随机时间错开（RandomStagger）和速率缩放间隔（RateScaledInterval）等工具，用于协调集群内节点的行为节奏，避免惊群效应。\n"
	case "eof":
		return "该文件提供 **EOF 处理工具**，实现 EOF 错误的检测和包装，用于区分正常结束和异常关闭。\n"
	case "file":
		return "该文件提供 **文件操作工具**，实现文件读取、写入和内容处理辅助函数，支持大文件分块读取。\n"
	case "funcs":
		return "该文件提供 **通用工具函数集合**，包含 UUID 验证、字符串处理、文件名清理、Map 复制、切片操作、时间格式化等常用辅助函数。是 Nomad 中最常用的工具函数集合。\n"
	case "opaque":
		return "该文件实现 **不透明数据工具**，提供不透明（Opaque）数据的编解码和传输工具，用于在 API 响应中隐藏内部实现细节。\n"
	case "retry":
		return "该文件实现 **通用重试工具**，提供带上下文的重试逻辑，支持自定义重试策略和错误判断，用于网络请求和外部服务调用的容错处理。\n"
	case "warning":
		return "该文件实现 **警告日志工具**，提供去重警告日志功能，避免重复警告信息刷屏，用于记录非致命但值得注意的事件。\n"
	}

	// Check for _ce suffix (Community Edition stubs)
	if strings.HasSuffix(baseName, "_ce") {
		return "该文件是 **社区版（CE）存根实现**，为 Nomad 企业版功能提供社区版的空实现，通过 build tag 机制在编译时选择。\n"
	}

	return "该文件属于 Nomad 辅助工具核心包（`helper`），提供通用工具功能。\n"
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
	if strings.HasSuffix(info.FileName, "_testing.go") || info.DirName == "testlog" || info.DirName == "testtask" {
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

	if len(patterns) == 0 {
		patterns = append(patterns, "- 遵循 Go 标准代码组织规范，作为 Nomad 辅助工具的一部分")
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
