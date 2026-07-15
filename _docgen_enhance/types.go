package main

import (
	"fmt"
	"go/ast"
	"go/token"
	"strings"
)

// FieldInfo describes a struct field or interface method with its comment.
type FieldInfo struct {
	Names   []string
	Type    string
	Tag     string
	Comment string // doc comment (from above or inline)
	Line    int
}

// TypeInfo describes a type declaration with enhanced comment data.
type TypeInfo struct {
	Name       string
	Kind       string // "struct", "interface", "type"
	Def        string // for type aliases
	Fields     []FieldInfo
	Methods    []string
	DocComment string
	Line       int
}

// ConstInfo describes a constant with its comment.
type ConstInfo struct {
	Name    string
	Value   string
	Type    string
	Comment string
	Line    int
}

// VarInfo describes a variable with its comment.
type VarInfo struct {
	Name    string
	Value   string
	Type    string
	Comment string
	Line    int
}

// ParamInfo describes a function parameter.
type ParamInfo struct {
	Name string
	Type string
}

// ReturnInfo describes a function return value.
type ReturnInfo struct {
	Name string
	Type string
}

// FuncInfo describes a function or method with enhanced comment data.
type FuncInfo struct {
	Name       string
	Receiver   string
	RcvVar     string
	Params     []ParamInfo
	Returns    []ReturnInfo
	Line       int
	IsExported bool
	DocComment string
	// ParamComments maps parameter name to its doc comment (extracted from function doc)
	ParamComments map[string]string
}

// FileInfo holds all extracted information about a Go source file.
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
	PackageDoc  string
}

// parseFile parses a Go source file and extracts all declarations with comments.
func parseFile(filePath string, content string) (*FileInfo, error) {
	info := &FileInfo{
		FileName:    fileName(filePath),
		FilePath:    filePath,
		PackageName: "main",
		LineCount:   strings.Count(content, "\n") + 1,
	}

	// Extract copyright, license, build tags via regex
	extractMeta(info, content)

	fset := token.NewFileSet()
	f, err := parseGoAST(fset, filePath, content)
	if err != nil {
		return nil, fmt.Errorf("parse error: %w", err)
	}

	info.PackageName = f.Name.Name

	// Extract package doc comment
	if f.Doc != nil && len(f.Doc.List) > 0 {
		var lines []string
		for _, c := range f.Doc.List {
			lines = append(lines, strings.TrimPrefix(c.Text, "// "))
		}
		info.PackageDoc = strings.Join(lines, "\n")
	}

	// Extract imports
	for _, imp := range f.Imports {
		path := strings.Trim(imp.Path.Value, `"`)
		info.Imports = append(info.Imports, path)
	}

	// First pass: collect methods by receiver type
	typeMethods := collectMethods(f)

	// Second pass: extract all declarations
	for _, decl := range f.Decls {
		switch d := decl.(type) {
		case *ast.GenDecl:
			switch d.Tok {
			case token.TYPE:
				info.Types = append(info.Types, extractTypes(d, fset, typeMethods)...)
			case token.CONST:
				info.Constants = append(info.Constants, extractConstants(d, fset)...)
			case token.VAR:
				info.Variables = append(info.Variables, extractVariables(d, fset)...)
			}
		case *ast.FuncDecl:
			info.Functions = append(info.Functions, extractFunc(d, fset))
		}
	}

	return info, nil
}

// parseGoAST wraps parser.ParseFile for testability.
func parseGoAST(fset *token.FileSet, filePath, content string) (*ast.File, error) {
	return parserParseFile(fset, filePath, content)
}

// extractTypes extracts type declarations from a GenDecl.
func extractTypes(d *ast.GenDecl, fset *token.FileSet, typeMethods map[string][]string) []TypeInfo {
	var result []TypeInfo

	// Get the doc comment for the GenDecl (applies if single type)
	genDoc := ""
	if d.Doc != nil {
		genDoc = commentText(d.Doc)
	}

	for _, spec := range d.Specs {
		ts, ok := spec.(*ast.TypeSpec)
		if !ok {
			continue
		}

		typeInfo := TypeInfo{
			Name:    ts.Name.Name,
			Line:    fset.Position(ts.Pos()).Line,
			Methods: typeMethods[ts.Name.Name],
		}

		// Use spec-level doc if available, otherwise use gen-level
		if ts.Doc != nil {
			typeInfo.DocComment = commentText(ts.Doc)
		} else if len(d.Specs) == 1 {
			typeInfo.DocComment = genDoc
		}

		switch st := ts.Type.(type) {
		case *ast.StructType:
			typeInfo.Kind = "struct"
			if st.Fields != nil {
				typeInfo.Fields = extractFields(st.Fields, fset)
			}
		case *ast.InterfaceType:
			typeInfo.Kind = "interface"
			if st.Methods != nil {
				typeInfo.Fields = extractInterfaceMethods(st.Methods, fset)
			}
		default:
			typeInfo.Kind = "type"
			typeInfo.Def = exprString(ts.Type)
		}

		result = append(result, typeInfo)
	}

	return result
}

// extractFields extracts struct fields with comments.
func extractFields(fl *ast.FieldList, fset *token.FileSet) []FieldInfo {
	var fields []FieldInfo

	for _, field := range fl.List {
		fi := FieldInfo{
			Type: exprString(field.Type),
			Line: fset.Position(field.Pos()).Line,
		}

		// Extract field names
		if len(field.Names) == 0 {
			// Embedded field - use type name
			fi.Names = []string{fi.Type}
		} else {
			for _, n := range field.Names {
				fi.Names = append(fi.Names, n.Name)
			}
		}

		// Extract tag
		if field.Tag != nil {
			fi.Tag = field.Tag.Value
		}

		// Extract comment - prefer Doc (above), fall back to Comment (inline)
		if field.Doc != nil {
			fi.Comment = commentText(field.Doc)
		} else if field.Comment != nil {
			fi.Comment = commentText(field.Comment)
		}

		fields = append(fields, fi)
	}

	return fields
}

// extractInterfaceMethods extracts interface methods with comments.
func extractInterfaceMethods(fl *ast.FieldList, fset *token.FileSet) []FieldInfo {
	var methods []FieldInfo

	for _, m := range fl.List {
		fi := FieldInfo{
			Type: exprString(m.Type),
			Line: fset.Position(m.Pos()).Line,
		}

		if len(m.Names) == 0 {
			// Embedded interface
			fi.Names = []string{fi.Type}
		} else {
			for _, n := range m.Names {
				fi.Names = append(fi.Names, n.Name)
			}
		}

		if m.Doc != nil {
			fi.Comment = commentText(m.Doc)
		} else if m.Comment != nil {
			fi.Comment = commentText(m.Comment)
		}

		methods = append(methods, fi)
	}

	return methods
}

// extractConstants extracts constant declarations with comments.
func extractConstants(d *ast.GenDecl, fset *token.FileSet) []ConstInfo {
	var result []ConstInfo

	genDoc := ""
	if d.Doc != nil {
		genDoc = commentText(d.Doc)
	}

	for _, spec := range d.Specs {
		vs, ok := spec.(*ast.ValueSpec)
		if !ok {
			continue
		}

		specDoc := ""
		if vs.Doc != nil {
			specDoc = commentText(vs.Doc)
		} else if len(d.Specs) == 1 {
			specDoc = genDoc
		}

		typeStr := ""
		if vs.Type != nil {
			typeStr = exprString(vs.Type)
		}

		for i, n := range vs.Names {
			ci := ConstInfo{
				Name:    n.Name,
				Type:    typeStr,
				Comment: specDoc,
				Line:    fset.Position(vs.Pos()).Line,
			}
			if i < len(vs.Values) {
				ci.Value = exprString(vs.Values[i])
			}
			result = append(result, ci)
		}
	}

	return result
}

// extractVariables extracts variable declarations with comments.
func extractVariables(d *ast.GenDecl, fset *token.FileSet) []VarInfo {
	var result []VarInfo

	genDoc := ""
	if d.Doc != nil {
		genDoc = commentText(d.Doc)
	}

	for _, spec := range d.Specs {
		vs, ok := spec.(*ast.ValueSpec)
		if !ok {
			continue
		}

		specDoc := ""
		if vs.Doc != nil {
			specDoc = commentText(vs.Doc)
		} else if len(d.Specs) == 1 {
			specDoc = genDoc
		}

		typeStr := ""
		if vs.Type != nil {
			typeStr = exprString(vs.Type)
		}

		for i, n := range vs.Names {
			vi := VarInfo{
				Name:    n.Name,
				Type:    typeStr,
				Comment: specDoc,
				Line:    fset.Position(vs.Pos()).Line,
			}
			if i < len(vs.Values) {
				vi.Value = exprString(vs.Values[i])
			}
			result = append(result, vi)
		}
	}

	return result
}

// extractFunc extracts a function or method declaration with comments.
func extractFunc(d *ast.FuncDecl, fset *token.FileSet) FuncInfo {
	fi := FuncInfo{
		Name:       d.Name.Name,
		Line:       fset.Position(d.Pos()).Line,
		IsExported: d.Name.IsExported(),
	}

	if d.Doc != nil {
		fi.DocComment = commentText(d.Doc)
	}

	// Extract receiver
	if d.Recv != nil && len(d.Recv.List) > 0 {
		recvField := d.Recv.List[0]
		if len(recvField.Names) > 0 {
			fi.RcvVar = recvField.Names[0].Name
		}
		recvTypeStr := exprString(recvField.Type)
		fi.Receiver = strings.TrimPrefix(recvTypeStr, "*")
	}

	// Extract parameters
	if d.Type.Params != nil {
		for _, param := range d.Type.Params.List {
			typeStr := exprString(param.Type)
			if len(param.Names) == 0 {
				fi.Params = append(fi.Params, ParamInfo{Type: typeStr})
			} else {
				for _, pn := range param.Names {
					fi.Params = append(fi.Params, ParamInfo{Name: pn.Name, Type: typeStr})
				}
			}
		}
	}

	// Extract return values
	if d.Type.Results != nil {
		for _, result := range d.Type.Results.List {
			typeStr := exprString(result.Type)
			if len(result.Names) == 0 {
				fi.Returns = append(fi.Returns, ReturnInfo{Type: typeStr})
			} else {
				for _, rn := range result.Names {
					fi.Returns = append(fi.Returns, ReturnInfo{Name: rn.Name, Type: typeStr})
				}
			}
		}
	}

	// Extract param comments from doc comment
	fi.ParamComments = extractParamComments(fi.DocComment, fi.Params)

	return fi
}

// extractParamComments extracts parameter descriptions from a Go doc comment.
// Go convention: parameters are documented as lines starting with the param name.
func extractParamComments(docComment string, params []ParamInfo) map[string]string {
	if docComment == "" {
		return nil
	}

	result := map[string]string{}
	lines := strings.Split(docComment, "\n")

	for _, p := range params {
		if p.Name == "" {
			continue
		}
		// Look for lines that mention the parameter name
		for _, line := range lines {
			line = strings.TrimSpace(line)
			// Common patterns: "- paramName: description" or "paramName: description"
			if strings.HasPrefix(line, "- "+p.Name+":") || strings.HasPrefix(line, p.Name+":") {
				desc := strings.SplitN(line, ":", 2)
				if len(desc) == 2 {
					result[p.Name] = strings.TrimSpace(desc[1])
				}
			}
		}
	}

	if len(result) == 0 {
		return nil
	}
	return result
}

// collectMethods builds a map of type name to method names.
func collectMethods(f *ast.File) map[string][]string {
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
	return typeMethods
}

// commentText extracts text from an ast.CommentGroup, stripping // or /* */.
func commentText(cg *ast.CommentGroup) string {
	if cg == nil {
		return ""
	}
	var lines []string
	for _, c := range cg.List {
		text := c.Text
		if strings.HasPrefix(text, "//") {
			text = strings.TrimPrefix(text, "//")
			text = strings.TrimSpace(text)
		} else if strings.HasPrefix(text, "/*") {
			text = strings.TrimPrefix(text, "/*")
			text = strings.TrimSuffix(text, "*/")
			text = strings.TrimSpace(text)
		}
		if text != "" {
			lines = append(lines, text)
		}
	}
	return strings.Join(lines, "\n")
}
