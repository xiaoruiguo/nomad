package main

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

func main() {
	rootDir := `d:\claude\nomad`

	// Directories to skip
	skipDirs := map[string]bool{
		".tmp":               true,
		"node_modules":       true,
		"_docgen_remaining":  true,
		"_docgen_enhance":    true,
		"_docgen_nomad":      true,
		"_docgen_scheduler":  true,
		"_docgen_helper":     true,
		"_docgen_client":     true,
		"vendor":             true,
		".git":               true,
		".github":            true,
		".semgrep":           true,
		".trellis":           true,
		".vscode":            true,
		"dist":               true,
		"enos":               true,
		"scripts":            true,
		"terraform":          true,
		"ui":                 true,
		"website":            true,
		"CHANGELOG":          true,
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
		// Skip test files
		if strings.HasSuffix(name, "_test.go") {
			return nil
		}
		// Skip generated files
		if strings.Contains(name, "generated") || strings.HasSuffix(name, ".pb.go") {
			return nil
		}
		// Skip bindata
		if strings.Contains(name, "bindata") {
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
	fmt.Printf("Found %d Go source files to process\n", total)

	count := 0
	errors := 0
	for _, filePath := range files {
		count++
		err := processFile(filePath, rootDir)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error processing %s: %v\n", filepath.Base(filePath), err)
			errors++
		}
		if count%50 == 0 {
			fmt.Printf("Progress: %d / %d\n", count, total)
		}
	}

	fmt.Printf("\nCompleted: %d / %d files processed, %d errors\n", count, total, errors)
}

// processFile reads, parses, and generates documentation for a single Go file.
func processFile(filePath, rootDir string) error {
	content, err := os.ReadFile(filePath)
	if err != nil {
		return err
	}
	contentStr := string(content)

	relPath, _ := filepath.Rel(rootDir, filePath)
	relPath = filepath.ToSlash(relPath)

	dirPath := filepath.Dir(filePath)
	dirName, _ := filepath.Rel(rootDir, dirPath)
	dirName = filepath.ToSlash(dirName)
	if dirName == "." {
		dirName = ""
	}

	info, err := parseFile(filePath, contentStr)
	if err != nil {
		// Fallback: generate basic doc without AST parsing
		info = &FileInfo{
			FileName:    filepath.Base(filePath),
			RelPath:     relPath,
			FilePath:    filePath,
			DirName:     dirName,
			PackageName: "parse_error",
			LineCount:   strings.Count(contentStr, "\n") + 1,
		}
		extractMeta(info, contentStr)
	}

	info.RelPath = relPath
	info.FilePath = filePath
	info.DirName = dirName

	// Detect platform-specific
	baseName := strings.TrimSuffix(filepath.Base(filePath), ".go")
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

	md := generateMarkdown(info, rootDir)
	outPath := filePath + ".md"
	return os.WriteFile(outPath, []byte(md), 0644)
}

// extractMeta extracts copyright, license, and build tags from file content.
func extractMeta(info *FileInfo, content string) {
	if m := regexp.MustCompile(`(?m)^//\s*(Copyright[^\r\n]*)`).FindStringSubmatch(content); m != nil {
		info.Copyright = strings.TrimSpace(m[1])
	}
	if m := regexp.MustCompile(`(?m)^//\s*(SPDX-License-Identifier:[^\r\n]*)`).FindStringSubmatch(content); m != nil {
		info.License = strings.TrimSpace(m[1])
	}
	if m := regexp.MustCompile(`(?m)^//go:build\s+(.+)$`).FindStringSubmatch(content); m != nil {
		info.BuildTags = strings.TrimSpace(m[1])
	} else if m := regexp.MustCompile(`(?m)^//\s*\+build\s+(.+)$`).FindStringSubmatch(content); m != nil {
		info.BuildTags = strings.TrimSpace(m[1])
	}
}

// fileName returns the base name of a file path.
func fileName(path string) string {
	return filepath.Base(path)
}

// fileExists checks if a file exists.
func fileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

// readDir reads directory entries.
func readDir(dir string) ([]os.DirEntry, error) {
	return os.ReadDir(dir)
}
