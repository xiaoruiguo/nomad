package main

import (
	"fmt"
	"path/filepath"
	"sort"
	"strings"
)

// generateMarkdown generates enhanced markdown documentation following the server.go.md template.
func generateMarkdown(info *FileInfo, rootDir string) string {
	var md strings.Builder

	fileURI := "file:///d:/claude/nomad/" + info.RelPath

	// Header
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

	// Section 1: File positioning and core responsibilities
	md.WriteString("## 1. 文件定位与核心职责\n\n")
	md.WriteString(categorizeFile(*info))
	if info.IsPlatform {
		md.WriteString(fmt.Sprintf("\n**平台特定实现**：此文件为 **%s** 平台专用，通过 build tag 机制在编译时选择。\n", info.Platform))
	}
	if info.BuildTags != "" && !info.IsPlatform {
		md.WriteString(fmt.Sprintf("\n**构建标签**：`%s`\n", info.BuildTags))
	}
	if info.PackageDoc != "" {
		md.WriteString(fmt.Sprintf("\n**包注释**：\n\n%s\n", info.PackageDoc))
	}
	md.WriteString("\n")

	// Section 2: Types
	md.WriteString("## 2. 类型定义\n\n")
	if len(info.Types) > 0 {
		for _, t := range info.Types {
			generateTypeSection(&md, t, fileURI)
		}
	} else {
		md.WriteString("该文件未定义类型。\n\n")
	}

	// Section 3: Constants and Variables
	md.WriteString("## 3. 常量与变量\n\n")
	hasConst := false
	if len(info.Constants) > 0 {
		hasConst = true
		generateConstantsSection(&md, info.Constants)
	}
	if len(info.Variables) > 0 {
		hasConst = true
		generateVariablesSection(&md, info.Variables)
	}
	if !hasConst {
		md.WriteString("该文件未定义顶级常量或变量。\n\n")
	}

	// Section 4: Functions index table
	md.WriteString("## 4. 方法与函数\n\n")
	if len(info.Functions) > 0 {
		md.WriteString("| 方法 | 接收者 | 参数 | 返回值 | 行号 |\n")
		md.WriteString("|------|--------|------|--------|------|\n")
		for _, f := range info.Functions {
			recv := "-"
			if f.Receiver != "" {
				recv = fmt.Sprintf("`%s *%s`", f.RcvVar, f.Receiver)
			}
			params := paramsToString(f.Params)
			returns := returnsToString(f.Returns)
			params = escapeMarkdownTable(params)
			returns = escapeMarkdownTable(returns)
			if len(params) > 80 {
				params = params[:77] + "..."
			}
			if len(returns) > 60 {
				returns = returns[:57] + "..."
			}
			md.WriteString(fmt.Sprintf("| `%s` | %s | `%s` | `%s` | [L%d](%s#L%d) |\n",
				f.Name, recv, params, returns, f.Line, fileURI, f.Line))
		}
		md.WriteString("\n")
	} else {
		md.WriteString("该文件未定义方法。\n\n")
	}

	// Section 5: Core method details
	md.WriteString("## 5. 核心方法详解\n\n")
	generateMethodDetails(&md, info.Functions, fileURI)

	// Section 6: Dependencies
	md.WriteString("## 6. 依赖关系\n\n")
	generateDependenciesSection(&md, info.Imports)

	// Section 7: Design patterns
	md.WriteString("## 7. 设计模式与技术特点\n\n")
	md.WriteString(describePatterns(*info))

	// Section 8: Related files
	md.WriteString("## 8. 相关文件\n\n")
	generateRelatedFiles(&md, info, rootDir)

	return md.String()
}

// generateTypeSection generates documentation for a single type.
func generateTypeSection(md *strings.Builder, t TypeInfo, fileURI string) {
	md.WriteString(fmt.Sprintf("### %s\n\n", t.Name))
	md.WriteString(fmt.Sprintf("**定义位置**：[L%d](%s#L%d)\n\n", t.Line, fileURI, t.Line))

	// Apply Chinese description: translate raw comment or infer from pattern
	chineseDesc := ""
	if t.DocComment != "" {
		translated := translateComment(t.DocComment)
		if translated != "" && containsChinese(translated) && !isPoorTranslation(translated, t.DocComment) {
			chineseDesc = translated
		}
	}
	if chineseDesc == "" {
		chineseDesc = describeTypeByPattern(t.Name, t.Kind, "")
	}
	if chineseDesc != "" {
		md.WriteString(fmt.Sprintf("**中文说明**：%s\n\n", chineseDesc))
	}

	switch t.Kind {
	case "struct":
		md.WriteString("**类型**：struct\n\n")
		// Show the struct definition in code block
		if len(t.Fields) > 0 {
			md.WriteString("```go\n")
			md.WriteString(fmt.Sprintf("type %s struct {\n", t.Name))
			for _, f := range t.Fields {
				line := "\t"
				if len(f.Names) > 0 {
					line += strings.Join(f.Names, ", ")
				} else {
					line += f.Type
				}
				if len(f.Names) > 0 {
					line += " " + f.Type
				}
				if f.Tag != "" {
					line += " " + f.Tag
				}
				line += "\n"
				md.WriteString(line)
			}
			md.WriteString("}\n")
			md.WriteString("```\n\n")
		}

		// Generate field description table - always generate for structs with fields
		if len(t.Fields) > 0 {
			md.WriteString("#### 字段说明表\n\n")
			md.WriteString("| 字段名 | 类型 | 中文说明 |\n")
			md.WriteString("|--------|------|----------|\n")
			for _, f := range t.Fields {
				name := strings.Join(f.Names, ", ")
				if name == "" {
					name = f.Type // embedded
				}
				comment := ""
				// First try source comment
				if f.Comment != "" {
					translated := translateComment(f.Comment)
					if translated != "" && containsChinese(translated) && !isPoorTranslation(translated, f.Comment) {
						comment = translated
					}
				}
				// If no good comment, infer from field name and type
				if comment == "" && len(f.Names) > 0 {
					comment = inferFieldDesc(f.Names[0], f.Type)
				}
				if comment == "" {
					comment = "—"
				}
				// Escape pipe in comment
				comment = strings.ReplaceAll(comment, "|", "\\|")
				typeStr := escapeMarkdownTable(f.Type)
				if f.Tag != "" {
					typeStr += " " + f.Tag
				}
				md.WriteString(fmt.Sprintf("| `%s` | `%s` | %s |\n", name, typeStr, comment))
			}
			md.WriteString("\n")
		}

	case "interface":
		md.WriteString("**类型**：interface\n\n")
		if len(t.Fields) > 0 {
			md.WriteString("```go\n")
			md.WriteString(fmt.Sprintf("type %s interface {\n", t.Name))
			for _, f := range t.Fields {
				line := "\t"
				if len(f.Names) > 0 {
					line += strings.Join(f.Names, ", ")
					line += " " + f.Type
				} else {
					line += f.Type
				}
				line += "\n"
				md.WriteString(line)
			}
			md.WriteString("}\n")
			md.WriteString("```\n\n")
		}

		// Generate method description table - always generate for interfaces with methods
		if len(t.Fields) > 0 {
			md.WriteString("#### 接口方法说明表\n\n")
			md.WriteString("| 方法名 | 签名 | 中文说明 |\n")
			md.WriteString("|--------|------|----------|\n")
			for _, f := range t.Fields {
				name := strings.Join(f.Names, ", ")
				if name == "" {
					name = f.Type
				}
				comment := ""
				// First try source comment
				if f.Comment != "" {
					translated := translateComment(f.Comment)
					if translated != "" && containsChinese(translated) && !isPoorTranslation(translated, f.Comment) {
						comment = translated
					}
				}
				// If no good comment, infer from method name
				if comment == "" && len(f.Names) > 0 {
					comment = describeFuncByPattern(f.Names[0], "")
				}
				if comment == "" {
					comment = "—"
				}
				comment = strings.ReplaceAll(comment, "|", "\\|")
				md.WriteString(fmt.Sprintf("| `%s` | `%s` | %s |\n", name, f.Type, comment))
			}
			md.WriteString("\n")
		}

	default:
		md.WriteString(fmt.Sprintf("**类型定义**：`type %s %s`\n\n", t.Name, t.Def))
	}

	if len(t.Methods) > 0 {
		md.WriteString(fmt.Sprintf("**关联方法**（%d 个）：%s\n\n", len(t.Methods), "`"+strings.Join(t.Methods, "`, `")+"`"))
	}
}

// generateConstantsSection generates the constants table with descriptions.
func generateConstantsSection(md *strings.Builder, constants []ConstInfo) {
	md.WriteString("### 常量\n\n")

	// Always use the 4-column table for consistency
	md.WriteString("| 名称 | 类型 | 值 | 中文说明 |\n")
	md.WriteString("|------|------|----|----------|\n")
	for _, c := range constants {
		val := escapeMarkdownTable(c.Value)
		if len(val) > 60 {
			val = val[:57] + "..."
		}
		comment := ""
		if c.Comment != "" {
			translated := translateComment(c.Comment)
			if translated != "" && containsChinese(translated) && !isPoorTranslation(translated, c.Comment) {
				comment = translated
			}
		}
		if comment == "" {
			comment = "—"
		}
		comment = strings.ReplaceAll(comment, "|", "\\|")
		typeStr := c.Type
		if typeStr == "" {
			typeStr = "—"
		}
		md.WriteString(fmt.Sprintf("| `%s` | `%s` | `%s` | %s |\n", c.Name, typeStr, val, comment))
	}
	md.WriteString("\n")
}

// generateVariablesSection generates the variables table with descriptions.
func generateVariablesSection(md *strings.Builder, variables []VarInfo) {
	md.WriteString("### 变量\n\n")

	// Always use the 4-column table for consistency
	md.WriteString("| 名称 | 类型 | 值 | 中文说明 |\n")
	md.WriteString("|------|------|----|----------|\n")
	for _, v := range variables {
		val := escapeMarkdownTable(v.Value)
		if len(val) > 60 {
			val = val[:57] + "..."
		}
		comment := ""
		if v.Comment != "" {
			translated := translateComment(v.Comment)
			if translated != "" && containsChinese(translated) && !isPoorTranslation(translated, v.Comment) {
				comment = translated
			}
		}
		if comment == "" {
			comment = "—"
		}
		comment = strings.ReplaceAll(comment, "|", "\\|")
		typeStr := v.Type
		if typeStr == "" {
			typeStr = "—"
		}
		md.WriteString(fmt.Sprintf("| `%s` | `%s` | `%s` | %s |\n", v.Name, typeStr, val, comment))
	}
	md.WriteString("\n")
}

// generateMethodDetails generates detailed documentation for key methods.
func generateMethodDetails(md *strings.Builder, functions []FuncInfo, fileURI string) {
	keyMethodPrefixes := []string{"New", "List", "Info", "Get", "Create", "Update", "Delete",
		"Register", "Deregister", "Parse", "Validate", "Read", "Write", "Run", "Init",
		"Start", "Shutdown", "Apply", "Close", "Snapshot", "Restore", "Lookup", "Open",
		"Copy", "Backoff", "Retry", "Dispense", "Reattach", "Catalog", "Generate",
		"Execute", "Launch", "Stop", "Destroy", "Inspect", "Stats", "Signal",
		"Fingerprint", "Recover", "Dispatch", "Scale", "Plan", "Submit", "Evaluate",
		"Allocate", "Deploy", "Reconcile", "Process", "Handle", "Serve", "Main",
		"Reload", "Leave", "Emit", "Set", "Watch", "Drain", "Block", "Wait",
		"Enqueue", "Dequeue", "Flush", "Subscribe", "Unsubscribe", "Auth",
		"Login", "Logout", "Verify", "Sign", "Encrypt", "Decrypt", "Hash",
		"Encode", "Decode", "Marshal", "Unmarshal", "Format", "Render", "Print",
		"Build", "Compile", "Analyze", "Check", "Test", "Load", "Save"}

	keyMethodSet := map[string]bool{}
	for _, p := range keyMethodPrefixes {
		keyMethodSet[p] = true
	}

	detailedCount := 0
	maxDetails := 12

	for _, f := range functions {
		if !f.IsExported || detailedCount >= maxDetails {
			continue
		}

		isKey := keyMethodSet[f.Name] || strings.HasPrefix(f.Name, "New")
		if !isKey {
			continue
		}

		md.WriteString(fmt.Sprintf("### %s()\n\n", f.Name))

		// Signature
		if f.Receiver != "" {
			md.WriteString(fmt.Sprintf("**签名**：`func (%s *%s) %s(%s) %s`\n\n",
				f.RcvVar, f.Receiver, f.Name, paramsToString(f.Params), returnsToString(f.Returns)))
		} else {
			md.WriteString(fmt.Sprintf("**签名**：`func %s(%s) %s`\n\n",
				f.Name, paramsToString(f.Params), returnsToString(f.Returns)))
		}

		md.WriteString(fmt.Sprintf("**位置**：[L%d](%s#L%d)\n\n", f.Line, fileURI, f.Line))

		// Doc comment as description (translated to Chinese)
		if f.DocComment != "" {
			translated := translateComment(f.DocComment)
			if translated != "" && containsChinese(translated) && !isPoorTranslation(translated, f.DocComment) {
				md.WriteString(fmt.Sprintf("**中文说明**：%s\n\n", translated))
			} else {
				// Fall back to pattern-based description
				chineseFuncDesc := describeFuncByPattern(f.Name, "")
				if chineseFuncDesc != "" {
					md.WriteString(fmt.Sprintf("**中文说明**：%s\n\n", chineseFuncDesc))
				}
			}
		} else {
			// No doc comment, use pattern-based description
			chineseFuncDesc := describeFuncByPattern(f.Name, "")
			if chineseFuncDesc != "" {
				md.WriteString(fmt.Sprintf("**中文说明**：%s\n\n", chineseFuncDesc))
			}
		}

		// Parameter table
		if len(f.Params) > 0 {
			md.WriteString("**参数说明**：\n\n")
			md.WriteString("| 参数名 | 类型 | 说明 |\n")
			md.WriteString("|--------|------|------|\n")
			for _, p := range f.Params {
				name := p.Name
				if name == "" {
					name = "—"
				}
				desc := ""
				if f.ParamComments != nil && f.ParamComments[p.Name] != "" {
					translated := translateComment(f.ParamComments[p.Name])
					if translated != "" && containsChinese(translated) && !isPoorTranslation(translated, f.ParamComments[p.Name]) {
						desc = translated
					}
				}
				if desc == "" && p.Name != "" {
					desc = inferFieldDesc(p.Name, p.Type)
				}
				if desc == "" {
					desc = "—"
				}
				desc = strings.ReplaceAll(desc, "|", "\\|")
				typeStr := escapeMarkdownTable(p.Type)
				md.WriteString(fmt.Sprintf("| `%s` | `%s` | %s |\n", name, typeStr, desc))
			}
			md.WriteString("\n")
		}

		// Return values
		if len(f.Returns) > 0 {
			md.WriteString("**返回值**：\n\n")
			md.WriteString("| 类型 | 说明 |\n")
			md.WriteString("|------|------|\n")
			for _, r := range f.Returns {
				name := r.Type
				if r.Name != "" {
					name = r.Name + " " + r.Type
				}
				name = escapeMarkdownTable(name)
				desc := inferFieldDesc(r.Name, r.Type)
				if desc == "" {
					desc = "—"
				}
				md.WriteString(fmt.Sprintf("| `%s` | %s |\n", name, desc))
			}
			md.WriteString("\n")
		}

		detailedCount++
	}

	if detailedCount == 0 {
		md.WriteString("该文件无导出的核心方法。\n\n")
	}
}

// generateDependenciesSection generates the import dependencies section.
func generateDependenciesSection(md *strings.Builder, imports []string) {
	if len(imports) == 0 {
		md.WriteString("该文件无导入包。\n\n")
		return
	}

	md.WriteString("### 导入包\n\n")
	md.WriteString("| 包路径 | 类型 |\n")
	md.WriteString("|--------|------|\n")

	stdLib, internal, thirdParty := []string{}, []string{}, []string{}
	for _, imp := range imports {
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

// generateRelatedFiles generates the related files section.
func generateRelatedFiles(md *strings.Builder, info *FileInfo, rootDir string) {
	md.WriteString("| 文件 | 关系 |\n")
	md.WriteString("|------|------|\n")

	// Test file
	testFile := strings.TrimSuffix(info.FileName, ".go") + "_test.go"
	testPath := filepath.Join(filepath.Dir(info.FilePath), testFile)
	if fileExists(testPath) {
		testRel := filepath.ToSlash(strings.TrimPrefix(testPath, rootDir+string(filepath.Separator)))
		testURI := "file:///d:/claude/nomad/" + testRel
		md.WriteString(fmt.Sprintf("| [%s](%s) | 对应测试文件 |\n", testFile, testURI))
	}

	// Other files in same directory
	dir := filepath.Dir(info.FilePath)
	entries, err := readDir(dir)
	if err == nil {
		count := 0
		for _, entry := range entries {
			if entry.IsDir() {
				continue
			}
			name := entry.Name()
			if name == info.FileName || name == info.FileName+".md" {
				continue
			}
			if !strings.HasSuffix(name, ".go") || strings.HasSuffix(name, "_test.go") {
				continue
			}
			if count >= 5 {
				break
			}
			relPath := filepath.ToSlash(filepath.Join(info.DirName, name))
			fileURI := "file:///d:/claude/nomad/" + relPath
			md.WriteString(fmt.Sprintf("| [%s](%s) | 同目录源文件 |\n", name, fileURI))
			count++
		}
	}
	md.WriteString("\n")
}

// paramsToString converts params to a comma-separated string.
func paramsToString(params []ParamInfo) string {
	var parts []string
	for _, p := range params {
		if p.Name != "" {
			parts = append(parts, p.Name+" "+p.Type)
		} else {
			parts = append(parts, p.Type)
		}
	}
	return strings.Join(parts, ", ")
}

// returnsToString converts returns to a comma-separated string.
func returnsToString(returns []ReturnInfo) string {
	var parts []string
	for _, r := range returns {
		if r.Name != "" {
			parts = append(parts, r.Name+" "+r.Type)
		} else {
			parts = append(parts, r.Type)
		}
	}
	return strings.Join(parts, ", ")
}

// escapeMarkdownTable escapes pipe characters for use in markdown tables.
func escapeMarkdownTable(s string) string {
	return strings.ReplaceAll(s, "|", "\\|")
}
