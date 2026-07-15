package main

import (
	"regexp"
	"strings"
)

// translateComment translates an English Go doc comment to Chinese using keyword-based rules.
// This is not a full translator but provides meaningful Chinese descriptions for common patterns.
// If translation quality is poor (mixed English/Chinese), returns empty to signal fallback.
func translateComment(comment string) string {
	if comment == "" {
		return ""
	}

	// If already contains Chinese characters, return as-is
	if containsChinese(comment) {
		return comment
	}

	// Apply translation rules
	result := comment

	// Common Go/Nomad terminology mappings (order matters - longer phrases first)
	translations := []struct {
		pattern string
		repl    string
	}{
		// Verb phrases first (longer matches first)
		{`(?i)\bis used to\b`, "用于"},
		{`(?i)\bis used for\b`, "用于"},
		{`(?i)\bis used by\b`, "由"},
		{`(?i)\bis used as\b`, "用作"},
		{`(?i)\bis used\b`, "被使用"},
		{`(?i)\bused to\b`, "用于"},
		{`(?i)\bused for\b`, "用于"},
		{`(?i)\bused by\b`, "被"},
		{`(?i)\bused as\b`, "用作"},
		{`(?i)\bare used\b`, "用于"},
		{`(?i)\bwill be\b`, "将"},
		{`(?i)\bwill be used\b`, "将用于"},
		{`(?i)\bshould be\b`, "应该"},
		{`(?i)\bshould not be\b`, "不应该"},
		{`(?i)\bmust be\b`, "必须"},
		{`(?i)\bmust not be\b`, "必须不"},
		{`(?i)\bcan be\b`, "可以"},
		{`(?i)\bcannot be\b`, "不能"},
		{`(?i)\bmay be\b`, "可能是"},
		{`(?i)\bcould be\b`, "可能是"},

		// Nomad domain phrases (longer first)
		{`(?i)\btask group\b`, "任务组"},
		{`(?i)\btask driver\b`, "任务驱动"},
		{`(?i)\bjob submission\b`, "作业提交"},
		{`(?i)\bjob spec\b`, "作业规格"},
		{`(?i)\bjob specification\b`, "作业规格"},
		{`(?i)\balloc\b`, "分配"},
		{`(?i)\ballocation\b`, "分配"},
		{`(?i)\beval\b`, "评估"},
		{`(?i)\bevaluation\b`, "评估"},
		{`(?i)\bscheduler\b`, "调度器"},
		{`(?i)\bscheduling\b`, "调度"},
		{`(?i)\bdeployment\b`, "部署"},
		{`(?i)\bnamespace\b`, "命名空间"},
		{`(?i)\bdatacenter\b`, "数据中心"},
		{`(?i)\bnode pool\b`, "节点池"},
		{`(?i)\bnode class\b`, "节点类"},
		{`(?i)\bheartbeat\b`, "心跳"},
		{`(?i)\bfingerprint\b`, "指纹采集"},
		{`(?i)\bplan submission\b`, "计划提交"},
		{`(?i)\bplan\b`, "计划"},
		{`(?i)\braft\b`, "Raft"},
		{`(?i)\bserf\b`, "Serf"},
		{`(?i)\bconsul\b`, "Consul"},
		{`(?i)\bvault\b`, "Vault"},
		{`(?i)\bkeyring\b`, "密钥环"},
		{`(?i)\bvariable\b`, "变量"},
		{`(?i)\bvolume\b`, "卷"},
		{`(?i)\bcsi\b`, "CSI"},
		{`(?i)\bplugin\b`, "插件"},
		{`(?i)\bdriver\b`, "驱动"},
		{`(?i)\bdevice\b`, "设备"},
		{`(?i)\btoken\b`, "令牌"},
		{`(?i)\bpolicy\b`, "策略"},
		{`(?i)\bacl\b`, "ACL"},
		{`(?i)\bworkload\b`, "工作负载"},
		{`(?i)\bidentity\b`, "身份"},
		{`(?i)\bsecret\b`, "密钥"},
		{`(?i)\bcheckpoint\b`, "检查点"},
		{`(?i)\bsnapshot\b`, "快照"},
		{`(?i)\bsnapshotter\b`, "快照器"},
		{`(?i)\brestore\b`, "恢复"},
		{`(?i)\breplication\b`, "复制"},
		{`(?i)\breplicate\b`, "复制"},
		{`(?i)\bfederation\b`, "联邦"},
		{`(?i)\bmember\b`, "成员"},
		{`(?i)\bpeer\b`, "对等节点"},
		{`(?i)\bleader\b`, "领导者"},
		{`(?i)\bfollower\b`, "跟随者"},
		{`(?i)\bquorum\b`, "法定人数"},
		{`(?i)\bconsensus\b`, "共识"},
		{`(?i)\bcommit\b`, "提交"},
		{`(?i)\bapplied\b`, "已应用"},
		{`(?i)\bapply\b`, "应用"},
		{`(?i)\bpropose\b`, "提议"},
		{`(?i)\bbootstrap\b`, "引导"},
		{`(?i)\bdrain\b`, "排空"},
		{`(?i)\bmigrate\b`, "迁移"},
		{`(?i)\bpreempt[io]*n\b`, "抢占"},
		{`(?i)\bcanary\b`, "金丝雀"},
		{`(?i)\bservice registration\b`, "服务注册"},
		{`(?i)\bservice\b`, "服务"},
		{`(?i)\bhealth check\b`, "健康检查"},
		{`(?i)\bhealth\b`, "健康"},
		{`(?i)\bcheck\b`, "检查"},
		{`(?i)\bconnect\b`, "Connect"},
		{`(?i)\bmesh\b`, "网格"},
		{`(?i)\bgateway\b`, "网关"},
		{`(?i)\bnamespace\b`, "命名空间"},
		{`(?i)\bregion\b`, "区域"},
		{`(?i)\bcluster\b`, "集群"},

		// Common technical terms
		{`(?i)\bgossip\b`, "Gossip"},
		{`(?i)\brpc\b`, "RPC"},
		{`(?i)\bgrpc\b`, "gRPC"},
		{`(?i)\bhttp\b`, "HTTP"},
		{`(?i)\bhttps\b`, "HTTPS"},
		{`(?i)\btls\b`, "TLS"},
		{`(?i)\bssl\b`, "SSL"},
		{`(?i)\bjson\b`, "JSON"},
		{`(?i)\byaml\b`, "YAML"},
		{`(?i)\bhcl\b`, "HCL"},
		{`(?i)\bapi\b`, "API"},
		{`(?i)\bcli\b`, "CLI"},
		{`(?i)\buuid\b`, "UUID"},
		{`(?i)\burl\b`, "URL"},
		{`(?i)\bttl\b`, "TTL"},
		{`(?i)\bcpu\b`, "CPU"},
		{`(?i)\bgpu\b`, "GPU"},
		{`(?i)\bmemory\b`, "内存"},
		{`(?i)\bdisk\b`, "磁盘"},
		{`(?i)\bnetwork\b`, "网络"},
		{`(?i)\bbandwidth\b`, "带宽"},
		{`(?i)\blatency\b`, "延迟"},
		{`(?i)\bthroughput\b`, "吞吐量"},
		{`(?i)\bperformance\b`, "性能"},
		{`(?i)\bscalability\b`, "可扩展性"},
		{`(?i)\bavailability\b`, "可用性"},
		{`(?i)\bconsistency\b`, "一致性"},

		// Verbs
		{`(?i)\breturns\b`, "返回"},
		{`(?i)\breturn\b`, "返回"},
		{`(?i)\bcreates\b`, "创建"},
		{`(?i)\bcreate\b`, "创建"},
		{`(?i)\bupdates\b`, "更新"},
		{`(?i)\bupdate\b`, "更新"},
		{`(?i)\bdeletes\b`, "删除"},
		{`(?i)\bdelete\b`, "删除"},
		{`(?i)\bgets\b`, "获取"},
		{`(?i)\bget\b`, "获取"},
		{`(?i)\bsets\b`, "设置"},
		{`(?i)\bset\b`, "设置"},
		{`(?i)\blists\b`, "列出"},
		{`(?i)\blist\b`, "列出"},
		{`(?i)\btracks\b`, "跟踪"},
		{`(?i)\btrack\b`, "跟踪"},
		{`(?i)\bmanages\b`, "管理"},
		{`(?i)\bmanage\b`, "管理"},
		{`(?i)\bhandles\b`, "处理"},
		{`(?i)\bhandle\b`, "处理"},
		{`(?i)\bchecks\b`, "检查"},
		{`(?i)\bcheck\b`, "检查"},
		{`(?i)\bvalidates\b`, "验证"},
		{`(?i)\bvalidate\b`, "验证"},
		{`(?i)\bparses\b`, "解析"},
		{`(?i)\bparse\b`, "解析"},
		{`(?i)\bstarts\b`, "启动"},
		{`(?i)\bstart\b`, "启动"},
		{`(?i)\bstops\b`, "停止"},
		{`(?i)\bstop\b`, "停止"},
		{`(?i)\bcloses\b`, "关闭"},
		{`(?i)\bclose\b`, "关闭"},
		{`(?i)\bopens\b`, "打开"},
		{`(?i)\bopen\b`, "打开"},
		{`(?i)\breads\b`, "读取"},
		{`(?i)\bread\b`, "读取"},
		{`(?i)\bwrites\b`, "写入"},
		{`(?i)\bwrite\b`, "写入"},
		{`(?i)\bloads\b`, "加载"},
		{`(?i)\bload\b`, "加载"},
		{`(?i)\bsaves\b`, "保存"},
		{`(?i)\bsave\b`, "保存"},
		{`(?i)\bflushes\b`, "刷新"},
		{`(?i)\bflush\b`, "刷新"},
		{`(?i)\benables\b`, "启用"},
		{`(?i)\benable\b`, "启用"},
		{`(?i)\bdisables\b`, "禁用"},
		{`(?i)\bdisable\b`, "禁用"},
		{`(?i)\bblocks\b`, "阻塞"},
		{`(?i)\bblock\b`, "阻塞"},
		{`(?i)\bunblocks\b`, "解除阻塞"},
		{`(?i)\bunblock\b`, "解除阻塞"},
		{`(?i)\bwaits\b`, "等待"},
		{`(?i)\bwait\b`, "等待"},
		{`(?i)\bprocesses\b`, "处理"},
		{`(?i)\bprocess\b`, "处理"},
		{`(?i)\bgenerates\b`, "生成"},
		{`(?i)\bgenerate\b`, "生成"},
		{`(?i)\bbuilds\b`, "构建"},
		{`(?i)\bbuild\b`, "构建"},
		{`(?i)\bcopies\b`, "复制"},
		{`(?i)\bcopy\b`, "复制"},
		{`(?i)\bregisters\b`, "注册"},
		{`(?i)\bregister\b`, "注册"},
		{`(?i)\bderegisters\b`, "注销"},
		{`(?i)\bderegister\b`, "注销"},
		{`(?i)\bdispatches\b`, "分发"},
		{`(?i)\bdispatch\b`, "分发"},
		{`(?i)\bsubscribes\b`, "订阅"},
		{`(?i)\bsubscribe\b`, "订阅"},
		{`(?i)\bunsubscribes\b`, "取消订阅"},
		{`(?i)\bunsubscribe\b`, "取消订阅"},
		{`(?i)\bemits\b`, "发送"},
		{`(?i)\bemit\b`, "发送"},
		{`(?i)\bcollects\b`, "收集"},
		{`(?i)\bcollect\b`, "收集"},
		{`(?i)\bcomputes\b`, "计算"},
		{`(?i)\bcompute\b`, "计算"},
		{`(?i)\bevaluates\b`, "评估"},
		{`(?i)\bevaluate\b`, "评估"},
		{`(?i)\bschedules\b`, "调度"},
		{`(?i)\bschedule\b`, "调度"},
		{`(?i)\ballocates\b`, "分配"},
		{`(?i)\ballocate\b`, "分配"},
		{`(?i)\bdeploys\b`, "部署"},
		{`(?i)\bdeploy\b`, "部署"},
		{`(?i)\breconciles\b`, "协调"},
		{`(?i)\breconcile\b`, "协调"},
		{`(?i)\bsnapshots\b`, "快照"},
		{`(?i)\bsnapshot\b`, "快照"},
		{`(?i)\brestores\b`, "恢复"},
		{`(?i)\brestore\b`, "恢复"},
		{`(?i)\blooks up\b`, "查找"},
		{`(?i)\blookup\b`, "查找"},
		{`(?i)\bsearches\b`, "搜索"},
		{`(?i)\bsearch\b`, "搜索"},
		{`(?i)\bencrypts\b`, "加密"},
		{`(?i)\bencrypt\b`, "加密"},
		{`(?i)\bdecrypts\b`, "解密"},
		{`(?i)\bdecrypt\b`, "解密"},
		{`(?i)\bsigns\b`, "签名"},
		{`(?i)\bsign\b`, "签名"},
		{`(?i)\bverifies\b`, "验证"},
		{`(?i)\bverify\b`, "验证"},
		{`(?i)\bauthenticates\b`, "认证"},
		{`(?i)\bauthenticate\b`, "认证"},
		{`(?i)\bauthorizes\b`, "授权"},
		{`(?i)\bauthorize\b`, "授权"},
		{`(?i)\bleave\b`, "离开"},
		{`(?i)\bjoin\b`, "加入"},
		{`(?i)\breloads\b`, "重载"},
		{`(?i)\breload\b`, "重载"},
		{`(?i)\brefreshes\b`, "刷新"},
		{`(?i)\brefresh\b`, "刷新"},
		{`(?i)\bwatches\b`, "监视"},
		{`(?i)\bwatch\b`, "监视"},
		{`(?i)\bserves\b`, "提供服务"},
		{`(?i)\bserve\b`, "提供服务"},
		{`(?i)\bruns\b`, "运行"},
		{`(?i)\brun\b`, "运行"},
		{`(?i)\bexecutes\b`, "执行"},
		{`(?i)\bexecute\b`, "执行"},
		{`(?i)\blaunches\b`, "启动"},
		{`(?i)\blaunch\b`, "启动"},
		{`(?i)\bdestroys\b`, "销毁"},
		{`(?i)\bdestroy\b`, "销毁"},
		{`(?i)\binspects\b`, "检查"},
		{`(?i)\binspect\b`, "检查"},
		{`(?i)\bsubmits\b`, "提交"},
		{`(?i)\bsubmit\b`, "提交"},
		{`(?i)\bscales\b`, "扩缩容"},
		{`(?i)\bscale\b`, "扩缩容"},
		{`(?i)\bretries\b`, "重试"},
		{`(?i)\bretry\b`, "重试"},
		{`(?i)\bbackoff\b`, "退避"},
		{`(?i)\bshutdown\b`, "关闭"},
		{`(?i)\binit\b`, "初始化"},
		{`(?i)\bmarshal\b`, "序列化"},
		{`(?i)\bunmarshal\b`, "反序列化"},
		{`(?i)\bencode\b`, "编码"},
		{`(?i)\bdecode\b`, "解码"},
		{`(?i)\bhash\b`, "哈希"},
		{`(?i)\bformat\b`, "格式化"},
		{`(?i)\brender\b`, "渲染"},
		{`(?i)\bprint\b`, "打印"},
		{`(?i)\bcompile\b`, "编译"},
		{`(?i)\banalyze\b`, "分析"},
		{`(?i)\btest\b`, "测试"},
		{`(?i)\bfetch\b`, "获取"},
		{`(?i)\bsend\b`, "发送"},
		{`(?i)\breceive\b`, "接收"},
		{`(?i)\bconnect\b`, "连接"},
		{`(?i)\bdisconnect\b`, "断开连接"},
		{`(?i)\bdial\b`, "拨号"},
		{`(?i)\blisten\b`, "监听"},
		{`(?i)\baccept\b`, "接受"},
		{`(?i)\bbind\b`, "绑定"},
		{`(?i)\badvertise\b`, "通告"},
		{`(?i)\bbroadcast\b`, "广播"},

		// Common adjectives
		{`(?i)\bavailable\b`, "可用的"},
		{`(?i)\bunavailable\b`, "不可用的"},
		{`(?i)\benabled\b`, "启用的"},
		{`(?i)\bdisabled\b`, "禁用的"},
		{`(?i)\bactive\b`, "活跃的"},
		{`(?i)\binactive\b`, "非活跃的"},
		{`(?i)\bvalid\b`, "有效的"},
		{`(?i)\binvalid\b`, "无效的"},
		{`(?i)\bsuccessful\b`, "成功的"},
		{`(?i)\bfailed\b`, "失败的"},
		{`(?i)\bcompleted\b`, "完成的"},
		{`(?i)\bpending\b`, "待处理的"},
		{`(?i)\brunning\b`, "运行中的"},
		{`(?i)\bstopped\b`, "已停止的"},
		{`(?i)\bblocked\b`, "阻塞的"},
		{`(?i)\bready\b`, "就绪的"},
		{`(?i)\bdeferred\b`, "延迟的"},
		{`(?i)\bscheduled\b`, "已调度的"},
		{`(?i)\bunscheduled\b`, "未调度的"},
		{`(?i)\bplaced\b`, "已放置的"},
		{`(?i)\bunplaced\b`, "未放置的"},
		{`(?i)\bassigned\b`, "已分配的"},
		{`(?i)\bunassigned\b`, "未分配的"},
		{`(?i)\bregistered\b`, "已注册的"},
		{`(?i)\bderegistered\b`, "已注销的"},
		{`(?i)\bconnected\b`, "已连接的"},
		{`(?i)\bdisconnected\b`, "已断开的"},
		{`(?i)\bhealthy\b`, "健康的"},
		{`(?i)\bunhealthy\b`, "不健康的"},
		{`(?i)\balive\b`, "存活的"},
		{`(?i)\bdead\b`, "死亡的"},
		{`(?i)\belected\b`, "已当选的"},
		{`(?i)\bcommitted\b`, "已提交的"},
		{`(?i)\bapplied\b`, "已应用的"},
		{`(?i)\bencrypted\b`, "已加密的"},
		{`(?i)\bdecrypted\b`, "已解密的"},
		{`(?i)\bsigned\b`, "已签名的"},
		{`(?i)\bverified\b`, "已验证的"},
		{`(?i)\bauthorized\b`, "已授权的"},
		{`(?i)\bauthenticated\b`, "已认证的"},
		{`(?i)\bdeprecated\b`, "已弃用"},
		{`(?i)\bexperimental\b`, "实验性"},

		// Common verbs (additional)
		{`(?i)\bsupports\b`, "支持"},
		{`(?i)\bsupport\b`, "支持"},
		{`(?i)\ballows\b`, "允许"},
		{`(?i)\ballow\b`, "允许"},
		{`(?i)\bprevents\b`, "防止"},
		{`(?i)\bprevent\b`, "防止"},
		{`(?i)\bensures\b`, "确保"},
		{`(?i)\bensure\b`, "确保"},
		{`(?i)\bguarantees\b`, "保证"},
		{`(?i)\bguarantee\b`, "保证"},
		{`(?i)\bprovides\b`, "提供"},
		{`(?i)\bprovide\b`, "提供"},
		{`(?i)\brepresents\b`, "表示"},
		{`(?i)\brepresent\b`, "表示"},
		{`(?i)\bcontains\b`, "包含"},
		{`(?i)\bcontain\b`, "包含"},
		{`(?i)\bholds\b`, "持有"},
		{`(?i)\bhold\b`, "持有"},
		{`(?i)\bstores\b`, "存储"},
		{`(?i)\bstore\b`, "存储"},
		{`(?i)\bcaches\b`, "缓存"},
		{`(?i)\bqueues\b`, "排队"},
		{`(?i)\bqueue\b`, "队列"},
		{`(?i)\bforwards\b`, "转发"},
		{`(?i)\bforward\b`, "转发"},
		{`(?i)\broutes\b`, "路由"},
		{`(?i)\broute\b`, "路由"},
		{`(?i)\bsends\b`, "发送"},
		{`(?i)\bsend\b`, "发送"},
		{`(?i)\breceives\b`, "接收"},
		{`(?i)\breceive\b`, "接收"},
		{`(?i)\baccepts\b`, "接受"},
		{`(?i)\baccept\b`, "接受"},
		{`(?i)\brejects\b`, "拒绝"},
		{`(?i)\breject\b`, "拒绝"},
		{`(?i)\bskips\b`, "跳过"},
		{`(?i)\bskip\b`, "跳过"},
		{`(?i)\bignores\b`, "忽略"},
		{`(?i)\bignore\b`, "忽略"},
		{`(?i)\bforces\b`, "强制"},
		{`(?i)\bforce\b`, "强制"},
		{`(?i)\btriggers\b`, "触发"},
		{`(?i)\btrigger\b`, "触发"},
		{`(?i)\bnotifies\b`, "通知"},
		{`(?i)\bnotify\b`, "通知"},
		{`(?i)\balerts\b`, "告警"},
		{`(?i)\balert\b`, "告警"},
		{`(?i)\bwarns\b`, "警告"},
		{`(?i)\bwarn\b`, "警告"},
		{`(?i)\breports\b`, "报告"},
		{`(?i)\breport\b`, "报告"},
		{`(?i)\blogs\b`, "记录日志"},
		{`(?i)\blog\b`, "日志"},
		{`(?i)\brecords\b`, "记录"},
		{`(?i)\brecord\b`, "记录"},
		{`(?i)\bmarks\b`, "标记"},
		{`(?i)\bmark\b`, "标记"},
		{`(?i)\btags\b`, "标记"},
		{`(?i)\btag\b`, "标签"},
		{`(?i)\blabels\b`, "标签"},
		{`(?i)\blabel\b`, "标签"},
		{`(?i)\bdescribes\b`, "描述"},
		{`(?i)\bdescribe\b`, "描述"},
		{`(?i)\bspecifies\b`, "指定"},
		{`(?i)\bspecify\b`, "指定"},
		{`(?i)\bdefines\b`, "定义"},
		{`(?i)\bdefine\b`, "定义"},
		{`(?i)\bdeclares\b`, "声明"},
		{`(?i)\bdeclare\b`, "声明"},
		{`(?i)\bimplements\b`, "实现"},
		{`(?i)\bimplement\b`, "实现"},
		{`(?i)\bextends\b`, "扩展"},
		{`(?i)\bextend\b`, "扩展"},
		{`(?i)\binherits\b`, "继承"},
		{`(?i)\binherit\b`, "继承"},
		{`(?i)\boverrides\b`, "覆盖"},
		{`(?i)\boverride\b`, "覆盖"},
		{`(?i)\bwraps\b`, "包装"},
		{`(?i)\bwrap\b`, "包装"},
		{`(?i)\bexposes\b`, "暴露"},
		{`(?i)\bexpose\b`, "暴露"},
		{`(?i)\bhides\b`, "隐藏"},
		{`(?i)\bhide\b`, "隐藏"},
		{`(?i)\baborts\b`, "中止"},
		{`(?i)\babort\b`, "中止"},
		{`(?i)\bcancels\b`, "取消"},
		{`(?i)\bcancel\b`, "取消"},
		{`(?i)\binterrupts\b`, "中断"},
		{`(?i)\binterrupt\b`, "中断"},
		{`(?i)\bpauses\b`, "暂停"},
		{`(?i)\bpause\b`, "暂停"},
		{`(?i)\bresumes\b`, "恢复"},
		{`(?i)\bresume\b`, "恢复"},
		{`(?i)\bfails\b`, "失败"},
		{`(?i)\bfail\b`, "失败"},
		{`(?i)\bsucceeds\b`, "成功"},
		{`(?i)\bsucceed\b`, "成功"},
		{`(?i)\bcompletes\b`, "完成"},
		{`(?i)\bcomplete\b`, "完成"},
		{`(?i)\bfinishes\b`, "完成"},
		{`(?i)\bfinish\b`, "完成"},
		{`(?i)\bbegins\b`, "开始"},
		{`(?i)\bbegin\b`, "开始"},
		{`(?i)\bends\b`, "结束"},
		{`(?i)\bend\b`, "结束"},
		{`(?i)\bterminates\b`, "终止"},
		{`(?i)\bterminate\b`, "终止"},
		{`(?i)\bkills\b`, "杀死"},
		{`(?i)\bkill\b`, "杀死"},
		{`(?i)\bremoves\b`, "移除"},
		{`(?i)\bremove\b`, "移除"},
		{`(?i)\bdrops\b`, "丢弃"},
		{`(?i)\bdrop\b`, "丢弃"},
		{`(?i)\badds\b`, "添加"},
		{`(?i)\badd\b`, "添加"},
		{`(?i)\bappends\b`, "追加"},
		{`(?i)\bappend\b`, "追加"},
		{`(?i)\bprepends\b`, "前置"},
		{`(?i)\bprepend\b`, "前置"},
		{`(?i)\binserts\b`, "插入"},
		{`(?i)\binsert\b`, "插入"},
		{`(?i)\bmodifies\b`, "修改"},
		{`(?i)\bmodify\b`, "修改"},
		{`(?i)\bchanges\b`, "更改"},
		{`(?i)\bchange\b`, "更改"},
		{`(?i)\bswaps\b`, "交换"},
		{`(?i)\bswap\b`, "交换"},
		{`(?i)\breplaces\b`, "替换"},
		{`(?i)\breplace\b`, "替换"},

		// Prepositions and connectors
		{`(?i)\bwhen\b`, "当"},
		{`(?i)\bif\b`, "如果"},
		{`(?i)\bunless\b`, "除非"},
		{`(?i)\buntil\b`, "直到"},
		{`(?i)\bafter\b`, "之后"},
		{`(?i)\bbefore\b`, "之前"},
		{`(?i)\bduring\b`, "期间"},
		{`(?i)\bwhile\b`, "当...时"},
		{`(?i)\bsince\b`, "自从"},
		{`(?i)\bbecause\b`, "因为"},
		{`(?i)\btherefore\b`, "因此"},
		{`(?i)\bhowever\b`, "然而"},
		{`(?i)\bbut\b`, "但"},
		{`(?i)\band\b`, "和"},
		{`(?i)\bor\b`, "或"},
		{`(?i)\bnot\b`, "不"},
		{`(?i)\bno\b`, "无"},
		{`(?i)\ball\b`, "所有"},
		{`(?i)\bany\b`, "任意"},
		{`(?i)\bsome\b`, "某些"},
		{`(?i)\beach\b`, "每个"},
		{`(?i)\bevery\b`, "每个"},
		{`(?i)\bother\b`, "其他"},
		{`(?i)\bsuch\b`, "这样的"},
		{`(?i)\bas\b`, "作为"},
		{`(?i)\bfor\b`, "用于"},
		{`(?i)\bwith\b`, "带有"},
		{`(?i)\bwithout\b`, "不带"},
		{`(?i)\bby\b`, "通过"},
		{`(?i)\bfrom\b`, "从"},
		{`(?i)\bto\b`, "到"},
		{`(?i)\binto\b`, "进入"},
		{`(?i)\bonto\b`, "到...上"},
		{`(?i)\bover\b`, "通过"},
		{`(?i)\bthrough\b`, "通过"},
		{`(?i)\bvia\b`, "经由"},
		{`(?i)\busing\b`, "使用"},
		{`(?i)\buse\b`, "使用"},
		{`(?i)\bcan\b`, "可以"},
		{`(?i)\bcannot\b`, "不能"},
		{`(?i)\bcould\b`, "可以"},
		{`(?i)\bshould\b`, "应该"},
		{`(?i)\bmust\b`, "必须"},
		{`(?i)\bmay\b`, "可能"},
		{`(?i)\bmight\b`, "可能"},
		{`(?i)\bwill\b`, "将"},
		{`(?i)\bwould\b`, "将"},
		{`(?i)\bshall\b`, "应"},
		{`(?i)\bthe\b`, ""},
		{`(?i)\ba\b`, ""},
		{`(?i)\ban\b`, ""},
		{`(?i)\bin\b`, "在"},
		{`(?i)\bon\b`, "在...上"},
		{`(?i)\bat\b`, "在"},
		{`(?i)\bof\b`, "的"},
		{`(?i)\bthis\b`, "此"},
		{`(?i)\bthat\b`, "该"},
		{`(?i)\bthese\b`, "这些"},
		{`(?i)\bthose\b`, "那些"},
		{`(?i)\bit\b`, "它"},
		{`(?i)\bits\b`, "其"},
		{`(?i)\btheir\b`, "其"},
		{`(?i)\bthem\b`, "它们"},
		{`(?i)\bthey\b`, "它们"},
		{`(?i)\bwe\b`, "我们"},
		{`(?i)\bour\b`, "我们的"},
		{`(?i)\bus\b`, "我们"},
		{`(?i)\byou\b`, "你"},
		{`(?i)\byour\b`, "你的"},
		{`(?i)\bwhich\b`, "哪个"},
		{`(?i)\bwhat\b`, "什么"},
		{`(?i)\bwhere\b`, "哪里"},
		{`(?i)\bwhen\b`, "何时"},
		{`(?i)\bhow\b`, "如何"},
		{`(?i)\bwhy\b`, "为什么"},

		// Common adjectives (additional)
		{`(?i)\boptional\b`, "可选"},
		{`(?i)\brequired\b`, "必需"},
		{`(?i)\bmandatory\b`, "强制"},
		{`(?i)\bnecessary\b`, "必要"},
		{`(?i)\bunnecessary\b`, "不必要"},
		{`(?i)\bimportant\b`, "重要"},
		{`(?i)\bcritical\b`, "关键"},
		{`(?i)\bessential\b`, "基本"},
		{`(?i)\bfundamental\b`, "基础"},
		{`(?i)\bprimary\b`, "主要"},
		{`(?i)\bsecondary\b`, "次要"},
		{`(?i)\bmain\b`, "主要"},
		{`(?i)\bmajor\b`, "主要"},
		{`(?i)\bminor\b`, "次要"},
		{`(?i)\bspecial\b`, "特殊"},
		{`(?i)\bnormal\b`, "正常"},
		{`(?i)\bdefault\b`, "默认"},
		{`(?i)\bcustom\b`, "自定义"},
		{`(?i)\bspecific\b`, "特定"},
		{`(?i)\bgeneral\b`, "通用"},
		{`(?i)\bcommon\b`, "通用"},
		{`(?i)\brare\b`, "罕见"},
		{`(?i)\bfrequent\b`, "频繁"},
		{`(?i)\busually\b`, "通常"},
		{`(?i)\btypically\b`, "典型"},
		{`(?i)\bgenerally\b`, "一般"},
		{`(?i)\bcommonly\b`, "通常"},
		{`(?i)\boften\b`, "经常"},
		{`(?i)\bsometimes\b`, "有时"},
		{`(?i)\balways\b`, "总是"},
		{`(?i)\bnever\b`, "从不"},
		{`(?i)\bmost\b`, "最多"},
		{`(?i)\bleast\b`, "最少"},
		{`(?i)\bmore\b`, "更多"},
		{`(?i)\bless\b`, "更少"},
		{`(?i)\bmany\b`, "许多"},
		{`(?i)\bmuch\b`, "大量"},
		{`(?i)\bempty\b`, "空"},
		{`(?i)\bfull\b`, "满"},
		{`(?i)\bpartial\b`, "部分"},
		{`(?i)\bcomplete\b`, "完整"},
		{`(?i)\bentire\b`, "整个"},
		{`(?i)\bwhole\b`, "全部"},

		// Additional technical terms
		{`(?i)\bstreaming\b`, "流式"},
		{`(?i)\bstream\b`, "流"},
		{`(?i)\bsubscription\b`, "订阅"},
		{`(?i)\bqueue\b`, "队列"},
		{`(?i)\bbroker\b`, "代理器"},
		{`(?i)\bworker\b`, "工作器"},
		{`(?i)\bpool\b`, "池"},
		{`(?i)\bcache\b`, "缓存"},
		{`(?i)\bbuffer\b`, "缓冲区"},
		{`(?i)\bbatch\b`, "批处理"},
		{`(?i)\btimer\b`, "定时器"},
		{`(?i)\bclock\b`, "时钟"},
		{`(?i)\bdelay\b`, "延迟"},
		{`(?i)\btimeout\b`, "超时"},
		{`(?i)\bdeadline\b`, "截止时间"},
		{`(?i)\bcontext\b`, "上下文"},
		{`(?i)\bcancel\b`, "取消"},
		{`(?i)\bnotify\b`, "通知"},
		{`(?i)\bsignal\b`, "信号"},
		{`(?i)\bhook\b`, "钩子"},
		{`(?i)\bcallback\b`, "回调"},
		{`(?i)\bhandler\b`, "处理器"},
		{`(?i)\blistener\b`, "监听器"},
		{`(?i)\bendpoint\b`, "端点"},
		{`(?i)\broute\b`, "路由"},
		{`(?i)\bmiddleware\b`, "中间件"},
		{`(?i)\binterceptor\b`, "拦截器"},
		{`(?i)\bfilter\b`, "过滤器"},
		{`(?i)\bmatcher\b`, "匹配器"},
		{`(?i)\bselector\b`, "选择器"},
		{`(?i)\bsorter\b`, "排序器"},
		{`(?i)\branker\b`, "排序器"},
		{`(?i)\bscorer\b`, "评分器"},
		{`(?i)\biterator\b`, "迭代器"},
		{`(?i)\bgenerator\b`, "生成器"},
		{`(?i)\bfactory\b`, "工厂"},
		{`(?i)\bbuilder\b`, "构建器"},
		{`(?i)\bprovider\b`, "提供者"},
		{`(?i)\bmanager\b`, "管理器"},
		{`(?i)\bcontroller\b`, "控制器"},
		{`(?i)\bwatcher\b`, "监视器"},
		{`(?i)\btracker\b`, "跟踪器"},
		{`(?i)\bmonitor\b`, "监视器"},
		{`(?i)\bobserver\b`, "观察者"},
		{`(?i)\bregistry\b`, "注册表"},
		{`(?i)\bcatalog\b`, "目录"},
		{`(?i)\bstore\b`, "存储"},
		{`(?i)\brepo\b`, "仓库"},
		{`(?i)\bdatabase\b`, "数据库"},
		{`(?i)\bdb\b`, "数据库"},
		{`(?i)\bschema\b`, "模式"},
		{`(?i)\btable\b`, "表"},
		{`(?i)\bindex\b`, "索引"},
		{`(?i)\bkey\b`, "键"},
		{`(?i)\bvalue\b`, "值"},
		{`(?i)\bfield\b`, "字段"},
		{`(?i)\bcolumn\b`, "列"},
		{`(?i)\brow\b`, "行"},
		{`(?i)\brecord\b`, "记录"},
		{`(?i)\bentry\b`, "条目"},
		{`(?i)\bitem\b`, "项"},
		{`(?i)\belement\b`, "元素"},
		{`(?i)\bentity\b`, "实体"},
		{`(?i)\bobject\b`, "对象"},
		{`(?i)\bclass\b`, "类"},
		{`(?i)\btype\b`, "类型"},
		{`(?i)\bkind\b`, "种类"},
		{`(?i)\binterface\b`, "接口"},
		{`(?i)\bstruct\b`, "结构体"},
		{`(?i)\bmethod\b`, "方法"},
		{`(?i)\bfunction\b`, "函数"},
		{`(?i)\bparameter\b`, "参数"},
		{`(?i)\bargument\b`, "参数"},
		{`(?i)\bresult\b`, "结果"},
		{`(?i)\boutput\b`, "输出"},
		{`(?i)\binput\b`, "输入"},
		{`(?i)\brequest\b`, "请求"},
		{`(?i)\bresponse\b`, "响应"},
		{`(?i)\bheader\b`, "头部"},
		{`(?i)\bbody\b`, "主体"},
		{`(?i)\bpayload\b`, "载荷"},
		{`(?i)\bstatus\b`, "状态"},
		{`(?i)\bstate\b`, "状态"},
		{`(?i)\berror\b`, "错误"},
		{`(?i)\bfailure\b`, "失败"},
		{`(?i)\bsuccess\b`, "成功"},
		{`(?i)\bwarning\b`, "警告"},
		{`(?i)\binfo\b`, "信息"},
		{`(?i)\bdebug\b`, "调试"},
		{`(?i)\btrace\b`, "跟踪"},
		{`(?i)\blevel\b`, "级别"},
		{`(?i)\bthreshold\b`, "阈值"},
		{`(?i)\blimit\b`, "限制"},
		{`(?i)\bmax\b`, "最大"},
		{`(?i)\bmin\b`, "最小"},
		{`(?i)\bcount\b`, "计数"},
		{`(?i)\bsize\b`, "大小"},
		{`(?i)\blength\b`, "长度"},
		{`(?i)\bcapacity\b`, "容量"},
		{`(?i)\bused\b`, "已用"},
		{`(?i)\bfree\b`, "空闲"},
		{`(?i)\btotal\b`, "总计"},
		{`(?i)\breserved\b`, "保留"},
		{`(?i)\ballocated\b`, "已分配"},
		{`(?i)\brequested\b`, "请求的"},

		// Deprecated marker
		{`(?i)\bDeprecated:`, "已弃用："},
		{`(?i)\bDeprecated\b`, "已弃用"},
		{`(?i)\bTODO\b`, "待办"},
		{`(?i)\bFIXME\b`, "待修复"},
		{`(?i)\bNOTE\b`, "注意"},
		{`(?i)\bWARNING\b`, "警告"},
	}

	for _, t := range translations {
		re, err := regexp.Compile(t.pattern)
		if err != nil {
			continue
		}
		result = re.ReplaceAllString(result, t.repl)
	}

	// Clean up extra spaces
	result = strings.TrimSpace(result)
	// Remove multiple spaces
	spaceRe := regexp.MustCompile(`\s+`)
	result = spaceRe.ReplaceAllString(result, " ")
	// Clean up "的 的" patterns
	result = strings.ReplaceAll(result, "的 的", "的")
	result = strings.TrimSpace(result)

	return result
}

// isPoorTranslation checks if a translation result is poor quality.
// A poor translation has too many remaining English words relative to Chinese characters.
func isPoorTranslation(translated, original string) bool {
	if translated == "" || !containsChinese(translated) {
		return true
	}

	// Count remaining English words (alphabetic sequences of 3+ chars, excluding acronyms)
	wordRe := regexp.MustCompile(`\b[a-zA-Z]{4,}\b`)
	englishWords := wordRe.FindAllString(translated, -1)

	// Count acronyms (all caps) which are acceptable
	acronymRe := regexp.MustCompile(`\b[A-Z]{2,}\b`)
	acronyms := acronymRe.FindAllString(translated, -1)

	// Filter out acronyms from english words count
	nonAcronymWords := 0
	acronymSet := map[string]bool{}
	for _, a := range acronyms {
		acronymSet[a] = true
	}
	for _, w := range englishWords {
		if !acronymSet[w] {
			nonAcronymWords++
		}
	}

	// Count Chinese characters
	chineseCount := 0
	for _, r := range translated {
		if r >= 0x4E00 && r <= 0x9FFF {
			chineseCount++
		}
	}

	// Strict check: if there are 2+ non-acronym English words (4+ chars, not all-caps),
	// the translation is likely "Chinglish" mixed text. Good translations keep at most
	// isolated proper nouns/acronyms; 2+ leftover English words signals broken translation.
	if nonAcronymWords >= 2 {
		return true
	}

	// Also check: if a short comment has even 1 non-acronym English word
	// and insufficient Chinese characters, consider it poor
	if nonAcronymWords >= 1 && chineseCount < 15 {
		return true
	}

	return false
}

// containsChinese checks if a string contains Chinese characters.
func containsChinese(s string) bool {
	for _, r := range s {
		if r >= 0x4E00 && r <= 0x9FFF {
			return true
		}
	}
	return false
}

// describeTypeByPattern generates a Chinese description for a type based on its name pattern.
func describeTypeByPattern(typeName, kind, docComment string) string {
	// Try translating the doc comment first
	if docComment != "" {
		translated := translateComment(docComment)
		if translated != "" && containsChinese(translated) && !isPoorTranslation(translated, docComment) {
			return translated
		}
	}

	// Infer from type name
	nameLower := strings.ToLower(typeName)

	// Common suffix patterns - more specific descriptions
	switch {
	case strings.HasSuffix(nameLower, "manager"):
		return typeName + " 是一个管理器，负责协调和管理相关资源的生命周期。"
	case strings.HasSuffix(nameLower, "watcher"):
		return typeName + " 是一个监视器，持续监控特定资源的状态变化并触发相应处理。"
	case strings.HasSuffix(nameLower, "tracker"):
		return typeName + " 是一个跟踪器，记录和跟踪特定对象的状态信息。"
	case strings.HasSuffix(nameLower, "monitor"):
		return typeName + " 是一个监视器，监控系统运行状态并上报指标。"
	case strings.HasSuffix(nameLower, "handler"):
		return typeName + " 是一个处理器，处理特定类型的事件或请求。"
	case strings.HasSuffix(nameLower, "controller"):
		return typeName + " 是一个控制器，协调和管理业务逻辑流程。"
	case strings.HasSuffix(nameLower, "provider"):
		return typeName + " 是一个提供者，提供特定功能的实现。"
	case strings.HasSuffix(nameLower, "factory"):
		return typeName + " 是一个工厂，负责创建对象实例。"
	case strings.HasSuffix(nameLower, "builder"):
		return typeName + " 是一个构建器，用于分步构建复杂对象。"
	case strings.HasSuffix(nameLower, "registry"):
		return typeName + " 是一个注册表，维护已注册组件的映射关系。"
	case strings.HasSuffix(nameLower, "cache"):
		return typeName + " 是一个缓存，存储常用数据以减少重复计算或 I/O。"
	case strings.HasSuffix(nameLower, "pool"):
		return typeName + " 是一个对象池，复用资源以减少分配开销。"
	case strings.HasSuffix(nameLower, "queue"):
		return typeName + " 是一个队列，按先进先出顺序管理待处理项。"
	case strings.HasSuffix(nameLower, "broker"):
		return typeName + " 是一个代理器，分发和管理待处理的消息或任务。"
	case strings.HasSuffix(nameLower, "worker"):
		return typeName + " 是一个工作器，从队列获取任务并执行处理。"
	case strings.HasSuffix(nameLower, "listener"):
		return typeName + " 是一个监听器，监听网络连接或事件。"
	case strings.HasSuffix(nameLower, "endpoint"):
		return typeName + " 是一个端点，提供特定 API 接口的实现。"
	case strings.HasSuffix(nameLower, "hook"):
		return typeName + " 是一个钩子，在特定生命周期节点执行自定义逻辑。"
	case strings.HasSuffix(nameLower, "iterator"):
		return typeName + " 是一个迭代器，按顺序遍历集合元素。"
	case strings.HasSuffix(nameLower, "config"):
		return typeName + " 是一个配置结构体，包含相关功能的配置参数。"
	case strings.HasSuffix(nameLower, "options"):
		return typeName + " 是一个选项结构体，提供功能配置选项。"
	case strings.HasSuffix(nameLower, "args"):
		return typeName + " 是一个参数结构体，封装函数或方法的输入参数。"
	case strings.HasSuffix(nameLower, "request"):
		return typeName + " 是一个请求结构体，封装 API 请求的参数。"
	case strings.HasSuffix(nameLower, "response"):
		return typeName + " 是一个响应结构体，封装 API 响应的数据。"
	case strings.HasSuffix(nameLower, "result"):
		return typeName + " 是一个结果结构体，封装操作执行的结果。"
	case strings.HasSuffix(nameLower, "error"):
		return typeName + " 是一个错误类型，描述特定的错误情况。"
	case strings.HasSuffix(nameLower, "stats"):
		return typeName + " 是一个统计结构体，记录相关指标的运行时数据。"
	case strings.HasSuffix(nameLower, "status"):
		return typeName + " 是一个状态结构体，描述对象或操作的当前状态。"
	case strings.HasSuffix(nameLower, "info"):
		return typeName + " 是一个信息结构体，包含对象的元数据或描述信息。"
	case strings.HasSuffix(nameLower, "meta"):
		return typeName + " 是一个元数据结构体，包含对象的附加元信息。"
	case strings.HasSuffix(nameLower, "spec"):
		return typeName + " 是一个规格定义结构体，描述对象的规格参数。"
	case strings.HasSuffix(nameLower, "stub"):
		return typeName + " 是一个桩结构体，用于列表查询时返回精简数据。"
	}

	// Nomad domain types - more specific descriptions
	switch {
	case strings.Contains(nameLower, "eval"):
		return typeName + " 与评估（Evaluation）相关，评估是 Nomad 调度系统的工作单元。"
	case strings.Contains(nameLower, "alloc"):
		return typeName + " 与分配（Allocation）相关，分配是作业在节点上的运行实例。"
	case strings.Contains(nameLower, "job"):
		return typeName + " 与作业（Job）相关，作业是 Nomad 调度的目标对象。"
	case strings.Contains(nameLower, "node"):
		return typeName + " 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。"
	case strings.Contains(nameLower, "task"):
		return typeName + " 与任务（Task）相关，任务是 Nomad 执行的最小单元。"
	case strings.Contains(nameLower, "deployment"):
		return typeName + " 与部署（Deployment）相关，部署管理作业的滚动更新过程。"
	case strings.Contains(nameLower, "scheduler"):
		return typeName + " 与调度器（Scheduler）相关，调度器负责将作业分配到合适的节点。"
	case strings.Contains(nameLower, "plan"):
		return typeName + " 与计划（Plan）相关，计划是调度器提交的分配方案。"
	case strings.Contains(nameLower, "raft"):
		return typeName + " 与 Raft 共识相关，用于维护集群状态的一致性。"
	case strings.Contains(nameLower, "serf"):
		return typeName + " 与 Serf 相关，用于集群成员管理和故障检测。"
	case strings.Contains(nameLower, "consul"):
		return typeName + " 与 Consul 集成相关，用于服务发现和配置管理。"
	case strings.Contains(nameLower, "vault"):
		return typeName + " 与 Vault 集成相关，用于密钥管理和动态凭据。"
	case strings.Contains(nameLower, "driver"):
		return typeName + " 与任务驱动（Driver）相关，驱动负责任务的实际执行。"
	case strings.Contains(nameLower, "plugin"):
		return typeName + " 与插件（Plugin）相关，实现可扩展的功能模块。"
	case strings.Contains(nameLower, "device"):
		return typeName + " 与设备（Device）相关，管理硬件资源如 GPU/FPGA。"
	case strings.Contains(nameLower, "volume"):
		return typeName + " 与卷（Volume）相关，管理持久化存储。"
	case strings.Contains(nameLower, "secret"):
		return typeName + " 与密钥（Secret）相关，管理敏感数据。"
	case strings.Contains(nameLower, "acl"):
		return typeName + " 与访问控制列表（ACL）相关，管理权限和认证。"
	case strings.Contains(nameLower, "token"):
		return typeName + " 与令牌（Token）相关，用于身份认证。"
	case strings.Contains(nameLower, "policy"):
		return typeName + " 与策略（Policy）相关，定义权限规则。"
	case strings.Contains(nameLower, "namespace"):
		return typeName + " 与命名空间（Namespace）相关，提供资源隔离。"
	case strings.Contains(nameLower, "region"):
		return typeName + " 与区域（Region）相关，Nomad 的多区域联邦单元。"
	case strings.Contains(nameLower, "datacenter"):
		return typeName + " 与数据中心（Datacenter）相关，区域内的故障域单元。"
	case strings.Contains(nameLower, "fingerprint"):
		return typeName + " 与指纹采集（Fingerprint）相关，收集节点硬件和软件信息。"
	case strings.Contains(nameLower, "heartbeat"):
		return typeName + " 与心跳（Heartbeat）相关，用于节点存活检测。"
	}

	if kind == "struct" {
		return typeName + " 是一个结构体，封装相关数据和状态。"
	}
	if kind == "interface" {
		return typeName + " 是一个接口，定义相关功能的契约规范。"
	}
	return ""
}

// describeFuncByPattern generates a Chinese description for a function based on its name pattern.
func describeFuncByPattern(funcName, docComment string) string {
	// Try translating the doc comment first
	if docComment != "" {
		translated := translateComment(docComment)
		if translated != "" && containsChinese(translated) && !isPoorTranslation(translated, docComment) {
			return translated
		}
	}

	nameLower := strings.ToLower(funcName)

	// New* constructors
	if strings.HasPrefix(funcName, "New") {
		objName := funcName[3:]
		if objName != "" {
			return "创建并返回一个新的 " + objName + " 实例。"
		}
		return "创建并返回一个新实例。"
	}

	// Common method patterns
	switch {
	case strings.HasPrefix(nameLower, "get"):
		return "获取" + inferObjectFromName(funcName, "get") + "的信息。"
	case strings.HasPrefix(nameLower, "list"):
		return "列出所有" + inferObjectFromName(funcName, "list") + "。"
	case strings.HasPrefix(nameLower, "create"):
		return "创建新的" + inferObjectFromName(funcName, "create") + "。"
	case strings.HasPrefix(nameLower, "update"):
		return "更新指定的" + inferObjectFromName(funcName, "update") + "。"
	case strings.HasPrefix(nameLower, "delete"):
		return "删除指定的" + inferObjectFromName(funcName, "delete") + "。"
	case strings.HasPrefix(nameLower, "register"):
		return "注册" + inferObjectFromName(funcName, "register") + "。"
	case strings.HasPrefix(nameLower, "deregister"):
		return "注销" + inferObjectFromName(funcName, "deregister") + "。"
	case strings.HasPrefix(nameLower, "validate"):
		return "验证" + inferObjectFromName(funcName, "validate") + "的有效性。"
	case strings.HasPrefix(nameLower, "parse"):
		return "解析" + inferObjectFromName(funcName, "parse") + "。"
	case strings.HasPrefix(nameLower, "copy"):
		return "创建" + inferObjectFromName(funcName, "copy") + "的副本。"
	case strings.HasPrefix(nameLower, "start"):
		return "启动" + inferObjectFromName(funcName, "start") + "。"
	case strings.HasPrefix(nameLower, "stop"):
		return "停止" + inferObjectFromName(funcName, "stop") + "。"
	case strings.HasPrefix(nameLower, "shutdown"):
		return "关闭" + inferObjectFromName(funcName, "shutdown") + "，释放相关资源。"
	case strings.HasPrefix(nameLower, "close"):
		return "关闭" + inferObjectFromName(funcName, "close") + "。"
	case strings.HasPrefix(nameLower, "run"):
		return "运行" + inferObjectFromName(funcName, "run") + "的主循环。"
	case strings.HasPrefix(nameLower, "init"):
		return "初始化" + inferObjectFromName(funcName, "init") + "。"
	case strings.HasPrefix(nameLower, "reload"):
		return "重新加载" + inferObjectFromName(funcName, "reload") + "的配置。"
	case strings.HasPrefix(nameLower, "flush"):
		return "刷新" + inferObjectFromName(funcName, "flush") + "，清空缓存数据。"
	case strings.HasPrefix(nameLower, "emit"):
		return "发送" + inferObjectFromName(funcName, "emit") + "相关的事件或指标。"
	case strings.HasPrefix(nameLower, "stats"):
		return "返回" + inferObjectFromName(funcName, "stats") + "的统计信息。"
	case strings.HasPrefix(nameLower, "info"):
		return "返回" + inferObjectFromName(funcName, "info") + "的信息。"
	case strings.HasPrefix(nameLower, "block"):
		return "阻塞" + inferObjectFromName(funcName, "block") + "。"
	case strings.HasPrefix(nameLower, "unblock"):
		return "解除阻塞" + inferObjectFromName(funcName, "unblock") + "。"
	case strings.HasPrefix(nameLower, "enqueue"):
		return "将" + inferObjectFromName(funcName, "enqueue") + "加入队列。"
	case strings.HasPrefix(nameLower, "dequeue"):
		return "从队列中取出" + inferObjectFromName(funcName, "dequeue") + "。"
	case strings.HasPrefix(nameLower, "subscribe"):
		return "订阅" + inferObjectFromName(funcName, "subscribe") + "的事件。"
	case strings.HasPrefix(nameLower, "snapshot"):
		return "创建" + inferObjectFromName(funcName, "snapshot") + "的快照。"
	case strings.HasPrefix(nameLower, "restore"):
		return "从快照恢复" + inferObjectFromName(funcName, "restore") + "的状态。"
	case strings.HasPrefix(nameLower, "apply"):
		return "应用" + inferObjectFromName(funcName, "apply") + "的变更。"
	}

	return ""
}

// inferObjectFromName extracts the object name from a function name by removing the prefix.
func inferObjectFromName(funcName, prefix string) string {
	obj := funcName[len(prefix):]
	if obj == "" {
		return "对象"
	}
	return obj
}

// inferFieldDesc generates a Chinese description for a struct field based on its name and type.
func inferFieldDesc(name, fieldType string) string {
	nameLower := strings.ToLower(name)

	// Common field name patterns
	switch {
	case nameLower == "id":
		return "唯一标识符"
	case nameLower == "name":
		return "名称"
	case nameLower == "description" || nameLower == "desc":
		return "描述信息"
	case nameLower == "type":
		return "类型"
	case nameLower == "kind":
		return "种类"
	case nameLower == "status":
		return "状态"
	case nameLower == "state":
		return "状态"
	case nameLower == "config" || nameLower == "cfg":
		return "配置"
	case nameLower == "options" || nameLower == "opts":
		return "选项"
	case nameLower == "args":
		return "参数"
	case nameLower == "params" || nameLower == "parameters":
		return "参数"
	case nameLower == "logger" || nameLower == "log":
		return "日志记录器"
	case nameLower == "ctx" || nameLower == "context":
		return "上下文，用于控制请求的生命周期"
	case nameLower == "err" || nameLower == "error":
		return "错误信息"
	case nameLower == "shutdownch":
		return "关闭信号通道，当收到关闭信号时触发清理流程"
	case nameLower == "shutdown":
		return "是否已关闭"
	case nameLower == "lock" || strings.HasSuffix(nameLower, "lock"):
		return "互斥锁，保护并发访问"
	case nameLower == "started":
		return "是否已启动"
	case nameLower == "stopped":
		return "是否已停止"
	case nameLower == "paused":
		return "是否已暂停"
	case nameLower == "running":
		return "是否运行中"
	case nameLower == "enabled":
		return "是否启用"
	case nameLower == "disabled":
		return "是否禁用"
	case nameLower == "closed":
		return "是否已关闭"
	case nameLower == "left":
		return "是否已离开集群"
	case nameLower == "bootstrapped":
		return "是否已完成引导"
	case nameLower == "ready":
		return "是否就绪"
	case nameLower == "active":
		return "是否活跃"
	case nameLower == "healthy":
		return "是否健康"
	case nameLower == "left":
		return "是否已离开"
	case nameLower == "version":
		return "版本号"
	case nameLower == "time" || nameLower == "timestamp":
		return "时间戳"
	case nameLower == "timeout":
		return "超时时间"
	case nameLower == "deadline":
		return "截止时间"
	case nameLower == "interval":
		return "时间间隔"
	case nameLower == "duration":
		return "持续时间"
	case nameLower == "delay":
		return "延迟时间"
	case nameLower == "ttl":
		return "生存时间（TTL）"
	case nameLower == "count":
		return "计数"
	case nameLower == "size":
		return "大小"
	case nameLower == "limit":
		return "限制"
	case nameLower == "max":
		return "最大值"
	case nameLower == "min":
		return "最小值"
	case nameLower == "index":
		return "索引"
	case nameLower == "offset":
		return "偏移量"
	case nameLower == "token":
		return "令牌，用于认证或标识"
	case nameLower == "key":
		return "键"
	case nameLower == "value":
		return "值"
	case nameLower == "data":
		return "数据"
	case nameLower == "result":
		return "结果"
	case nameLower == "response":
		return "响应"
	case nameLower == "request":
		return "请求"
	case nameLower == "message" || nameLower == "msg":
		return "消息"
	case nameLower == "event":
		return "事件"
	case nameLower == "error":
		return "错误"
	case nameLower == "warning" || nameLower == "warn":
		return "警告"
	case nameLower == "info":
		return "信息"
	case nameLower == "meta" || nameLower == "metadata":
		return "元数据"
	case nameLower == "labels":
		return "标签"
	case nameLower == "tags":
		return "标签"
	case nameLower == "path":
		return "路径"
	case nameLower == "url":
		return "URL 地址"
	case nameLower == "host":
		return "主机"
	case nameLower == "port":
		return "端口"
	case nameLower == "address" || nameLower == "addr":
		return "地址"
	case nameLower == "region":
		return "区域"
	case nameLower == "datacenter" || nameLower == "dc":
		return "数据中心"
	case nameLower == "namespace":
		return "命名空间"
	case nameLower == "policy":
		return "策略"
	case nameLower == "role":
		return "角色"
	case nameLower == "secret":
		return "密钥"
	case nameLower == "cert" || nameLower == "certificate":
		return "证书"
	case nameLower == "tls":
		return "TLS 配置"
	case nameLower == "tlsconf":
		return "TLS 配置"
	case nameLower == "rpc":
		return "RPC 相关"
	case nameLower == "rpcserver":
		return "RPC 服务端"
	case nameLower == "rpchandler":
		return "RPC 处理器"
	case nameLower == "rpclistener":
		return "RPC 监听器"
	case nameLower == "streamingrpcs":
		return "流式 RPC 注册表"
	case nameLower == "raft":
		return "Raft 共识实例"
	case nameLower == "raftstore":
		return "Raft 存储后端"
	case nameLower == "raftlayer":
		return "Raft 传输层"
	case nameLower == "rafttransport":
		return "Raft 网络传输"
	case nameLower == "raftinmem":
		return "Raft 内存存储"
	case nameLower == "serf":
		return "Serf 集群实例"
	case nameLower == "fsm":
		return "有限状态机，Raft 的状态存储后端"
	case nameLower == "evalbroker":
		return "评估代理器，管理待处理的评估"
	case nameLower == "blockedevals":
		return "阻塞评估管理器"
	case nameLower == "deploymentwatcher":
		return "部署监视器"
	case nameLower == "nodedrainer":
		return "节点排空器"
	case nameLower == "volumewatcher":
		return "卷监视器"
	case nameLower == "periodicdispatcher":
		return "周期性调度器"
	case nameLower == "workers":
		return "工作器列表"
	case nameLower == "workerlock":
		return "工作器互斥锁"
	case nameLower == "connpool":
		return "连接池"
	case nameLower == "peerscache":
		return "对等节点缓存"
	case nameLower == "encrypter":
		return "加密器，管理根密钥"
	case nameLower == "keyringreplicator":
		return "密钥环复制器"
	case nameLower == "planner":
		return "计划器，管理分配方案"
	case nameLower == "nodeheartbeater":
		return "节点心跳跟踪器"
	case nameLower == "statsfetcher":
		return "状态获取器"
	case nameLower == "reportingmanager":
		return "报告管理器"
	case nameLower == "oidcprovidercache":
		return "OIDC 提供者缓存"
	case nameLower == "oidcrequestcache":
		return "OIDC 请求缓存"
	case nameLower == "oidcdisco":
		return "OIDC 发现配置"
	case nameLower == "leaderacl":
		return "领导者的管理 ACL 令牌"
	case nameLower == "leaderacllock":
		return "领导者 ACL 互斥锁"
	case nameLower == "clusteridlock":
		return "集群 ID 互斥锁"
	case nameLower == "volumecontrollerfutures":
		return "卷控制器待处理 RPC 映射"
	case nameLower == "volumecontrollerlock":
		return "卷控制器互斥锁"
	case nameLower == "workershutdowngroup":
		return "工作器关闭等待组"
	case nameLower == "enterprisestate":
		return "企业版状态"
	case nameLower == "snapshotindex":
		return "快照索引，标记调度器首次调用的位置"
	case nameLower == "enabledschedulers":
		return "已启用的调度器列表"
	case nameLower == "failures":
		return "失败计数，用于计算退避"
	case nameLower == "failurebackoff":
		return "失败退避时间"
	case nameLower == "evaltoken":
		return "评估令牌"
	case nameLower == "pauseflag":
		return "暂停标志"
	case nameLower == "pausecond":
		return "暂停条件变量"
	case nameLower == "cancelfn":
		return "取消函数"
	case nameLower == "workloadstatus":
		return "工作负载状态"
	case nameLower == "statuslock":
		return "状态互斥锁"
	case nameLower == "srv":
		return "关联的 Server 实例"
	case nameLower == "start":
		return "启动时间"
	case nameLower == "pause":
		return "是否暂停"
	case nameLower == "cancel":
		return "取消"
	case nameLower == "snapshot":
		return "快照"
	case nameLower == "snapshotter":
		return "快照器"
	}

	// Type-based inference (check complex types before simple types)
	typeLower := strings.ToLower(fieldType)
	switch {
	case strings.Contains(typeLower, "chan struct"):
		return "信号通道"
	case strings.Contains(typeLower, "chan error"):
		return "错误通道"
	case strings.Contains(typeLower, "chan "):
		return "通道"
	case strings.Contains(typeLower, "sync.rwmutex"):
		return "读写锁，保护并发访问"
	case strings.Contains(typeLower, "sync.mutex"):
		return "互斥锁，保护并发访问"
	case strings.Contains(typeLower, "sync.cond"):
		return "条件变量，用于等待/通知"
	case strings.Contains(typeLower, "sync.waitgroup"):
		return "等待组，协调并发协程"
	case strings.Contains(typeLower, "context.context"):
		return "上下文，用于控制生命周期和取消"
	case strings.Contains(typeLower, "context.cancelfunc"):
		return "取消函数，用于取消上下文"
	case strings.Contains(typeLower, "logger") || strings.Contains(typeLower, "log."):
		return "日志记录器"
	case strings.Contains(typeLower, "*server"):
		return "关联的 Server 实例"
	case strings.Contains(typeLower, "*client"):
		return "关联的 Client 实例"
	case strings.Contains(typeLower, "*config"):
		return "配置对象"
	case strings.Contains(typeLower, "atomic.bool"):
		return "原子布尔值，支持并发安全读写"
	case strings.Contains(typeLower, "atomic."):
		return "原子类型，支持并发安全读写"
	case strings.Contains(typeLower, "time.duration"):
		return "时间间隔"
	case strings.Contains(typeLower, "time.time"):
		return "时间点"
	case strings.Contains(typeLower, "uint64"):
		if strings.Contains(nameLower, "index") {
			return "索引值（uint64）"
		}
		if strings.Contains(nameLower, "count") {
			return "计数（uint64）"
		}
		return "无符号 64 位整数"
	case strings.Contains(typeLower, "map["):
		return "映射表"
	case strings.Contains(typeLower, "[]byte"):
		return "字节数组"
	case strings.Contains(typeLower, "[]"):
		return "列表"
	case strings.Contains(typeLower, "interface{}") || strings.Contains(typeLower, "interface {}"):
		return "接口类型，可持有任意值"
	case strings.Contains(typeLower, "error"):
		return "错误信息"
	case strings.Contains(typeLower, "bool"):
		return "布尔值"
	case strings.Contains(typeLower, "string"):
		return "字符串"
	}

	return ""
}
