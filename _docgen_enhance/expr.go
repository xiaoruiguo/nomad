package main

import (
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"strings"
)

// parserParseFile wraps parser.ParseFile.
func parserParseFile(fset *token.FileSet, filePath, content string) (*ast.File, error) {
	return parser.ParseFile(fset, filePath, content, parser.ParseComments)
}

// exprString converts an ast.Expr to its string representation.
func exprString(expr ast.Expr) string {
	switch e := expr.(type) {
	case *ast.Ident:
		return e.Name
	case *ast.StarExpr:
		return "*" + exprString(e.X)
	case *ast.SelectorExpr:
		return exprString(e.X) + "." + e.Sel.Name
	case *ast.ArrayType:
		if e.Len == nil {
			return "[]" + exprString(e.Elt)
		}
		return "[" + exprString(e.Len) + "]" + exprString(e.Elt)
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
		prefix := "chan "
		if e.Dir == ast.SEND {
			prefix = "chan<- "
		} else if e.Dir == ast.RECV {
			prefix = "<-chan "
		}
		return prefix + exprString(e.Value)
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
	case *ast.TypeAssertExpr:
		if e.Type == nil {
			return exprString(e.X) + ".(type)"
		}
		return exprString(e.X) + ".(" + exprString(e.Type) + ")"
	case *ast.SliceExpr:
		result := exprString(e.X) + "["
		if e.Low != nil {
			result += exprString(e.Low)
		}
		result += ":"
		if e.High != nil {
			result += exprString(e.High)
		}
		if e.Slice3 {
			result += ":"
			if e.Max != nil {
				result += exprString(e.Max)
			}
		}
		return result + "]"
	default:
		return fmt.Sprintf("%T", expr)
	}
}
