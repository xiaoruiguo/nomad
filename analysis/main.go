package main

import (
	"fmt"
	"log"
	"os"

	"github.com/hashicorp/cli"
)

// ---------- 命令：foo ----------
type FooCommand struct{}

func (c *FooCommand) Run(args []string) int {
	fmt.Println("执行 foo 命令，参数：", args)
	return 0
}

func (c *FooCommand) Synopsis() string {
	return "打印 foo 信息"
}

func (c *FooCommand) Help() string {
	return "用法: app foo [参数...]\n  这是一个示例 foo 命令。"
}

func fooCommandFactory() (cli.Command, error) {
	return &FooCommand{}, nil
}

// ---------- 命令：bar ----------
type BarCommand struct{}

func (c *BarCommand) Run(args []string) int {
	fmt.Println("执行 bar 命令，参数：", args)
	return 0
}

func (c *BarCommand) Synopsis() string {
	return "打印 bar 信息"
}

func (c *BarCommand) Help() string {
	return "用法: app bar [参数...]\n  这是一个示例 bar 命令。"
}

func barCommandFactory() (cli.Command, error) {
	return &BarCommand{}, nil
}

// ---------- main ----------
func main() {
	c := cli.NewCLI("app", "1.0.0")
	c.Args = os.Args[1:]
	c.Commands = map[string]cli.CommandFactory{
		"foo": fooCommandFactory,
		"bar": barCommandFactory,
	}

	exitStatus, err := c.Run()
	if err != nil {
		log.Println(err)
	}
	os.Exit(exitStatus)
}
