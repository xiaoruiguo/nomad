import{a as o,j as e}from"./query-Co1lJV3I.js";import{g as k}from"./variables-DDUdOIrG.js";import{L as w,a as g,B as b}from"./index-ChjVs0V0.js";import{d as N,e as A}from"./react-jQqHps4-.js";import"./ui-DyRZLW9A.js";const c=[{id:"nomad/job-templates/default/hello-world",name:"Hello World",description:'A simple job that runs a single task on a single node. This job uses the exec driver to run an HTTP server that responds with "Hello World!".',template:`job "hello-world" {
  datacenters = ["dc1"]
  type = "service"

  group "hello" {
    count = 1

    network {
      port "http" { static = 8080 }
    }

    task "server" {
      driver = "exec"

      config {
        command = "/usr/bin/echo"
        args = ["hello"]
      }

      resources {
        cpu = 100
        memory = 64
      }
    }
  }
}`,isDefault:!0},{id:"nomad/job-templates/default/actions",name:"Actions",description:"A Redis management job demonstrating Nomad Actions. Includes actions for adding, listing, and deleting keys, as well as health checks and toggling persistence.",template:`job "redis-actions" {
  datacenters = ["dc1"]
  type = "service"
  priority = 50

  group "redis" {
    count = 1

    network {
      port "db" {}
    }

    task "redis" {
      driver = "docker"

      config {
        image = "redis:7-alpine"
        ports = ["db"]
      }

      env {
        REDIS_ARGS = "--appendonly yes"
      }

      resources {
        cpu = 200
        memory = 256
      }
    }
  }
}`,isDefault:!0},{id:"nomad/job-templates/default/parameterized-job",name:"Parameterized Job",description:"A parameterized job that can be dispatched multiple times with different payloads and metadata values.",template:`job "batch-processor" {
  datacenters = ["dc1"]
  type = "batch"

  parameterized {
    payload       = "required"
    meta_required = ["environment"]
    meta_optional = ["priority", "owner"]
  }

  group "worker" {
    count = 1

    restart {
      attempts = 2
      interval   = "30m"
      delay      = "15s"
      mode       = "fail"
    }

    task "process" {
      driver = "exec"

      config {
        command = "/bin/sh"
        args    = ["local/input.sh"]
      }

      template "input" {
        data        = <<EOH
#!/bin/sh
echo "Processing input..."
cat \${NOMAD_TASK_DIR}/input.json
EOH
        destination = "local/input.sh"
        change_mode = "signal"
      }

      artifact {
        source      = "https://example.com/scripts/process.py"
        destination = "local/"
      }

      resources {
        cpu    = 500
        memory = 256
      }
    }
  }
}`,isDefault:!0},{id:"nomad/job-templates/default/service-discovery",name:"Service Discovery",description:"One group registers a service while another discovers it. Demonstrates service registration and health checking.",template:`job "service-discovery" {
  datacenters = ["dc1"]
  type = "service"

  group "web" {
    count = 3

    network {
      port "http" { to = 0 }
    }

    service {
      name     = "web-service"
      provider = "consul"
      port     = "http"

      check {
        type     = "http"
        path     = "/"
        interval = "10s"
        timeout  = "2s"
      }
    }

    task "nginx" {
      driver = "exec"

      config {
        command = "/usr/bin/echo"
        args    = ["serving on port $NOMAD_PORT_http"]
      }

      resources {
        cpu    = 100
        memory = 64
      }
    }
  }

  group "consumer" {
    count = 1

    task "client" {
      driver = "exec"

      config {
        command = "/usr/bin/curl"
        args    = ["http://web.service.consul:8080"]
      }

      resources {
        cpu    = 100
        memory = 64
      }
    }
  }
}`,isDefault:!0},{id:"nomad/job-templates/default/variables",name:"Variables",description:"An example of using Nomad Variables to configure a simple HTML page output.",template:`job "variables-example" {
  datacenters = ["dc1"]
  type = "service"

  group "web" {
    count = 1

    network {
      port "http" { static = 8080 }
    }

    task "server" {
      driver = "exec"

      config {
        command = "/usr/bin/echo"
        args = [
          "<html><body><h1>Hello from {{env "NOMAD_VAR_title"}}</h1></body></html>"
        ]
      }

      vault {
        policies = ["secrets"]
        change_mode = "signal"
      }

      resources {
        cpu    = 100
        memory = 64
      }
    }
  }
}`,isDefault:!0}];function T(r){const l=r.lastIndexOf("/");let a=l!==-1?r.slice(l+1):r;return a.charAt(0).toUpperCase()+a.slice(1).replace(/-/g," ")}function I(){const r=N(),[l]=A(),[a,x]=o.useState(l.get("template")||null),[m,p]=o.useState([]),[f,v]=o.useState(!0),[u,j]=o.useState(null);o.useEffect(()=>{async function t(){try{const d=((await k({prefix:"nomad/job-templates",namespace:"*"})).data||[]).filter(n=>!c.some(i=>i.id===n.Path)).map(n=>({id:n.Path,name:T(n.Path),description:"Custom job template",template:"",isDefault:!1}));p([...d,...c])}catch(s){j(s instanceof Error?s.message:String(s)),p(c)}finally{v(!1)}}t()},[]);const h=o.useCallback(t=>{x(t)},[]),y=o.useCallback(async()=>{var d,n;if(!a)return;let t="";const s=c.find(i=>i.id===a);if(s)t=s.template;else try{const i=await fetch(`/v1/var/${encodeURIComponent(a)}`);if(!i.ok)throw new Error("Failed to load template");t=((n=(d=(await i.json()).Items)==null?void 0:d.template)==null?void 0:n.Value)||""}catch{return}r(`/jobs/run?template=${encodeURIComponent(a)}&content=${encodeURIComponent(t)}`)},[a,r]);return f?e.jsx("div",{className:"flex items-center justify-center py-20",children:e.jsx(w,{size:"lg"})}):u&&m.length===0?e.jsx("div",{className:"p-6",children:e.jsxs("div",{className:"rounded-lg border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700 dark:border-danger-800 dark:bg-danger-900/20 dark:text-danger-400",children:["Failed to load templates: ",u]})}):e.jsxs("div",{className:"space-y-6 p-6",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-xl font-semibold text-neutral-900 dark:text-neutral-100",children:"Choose a Template"}),e.jsxs("p",{className:"mt-1 text-sm text-neutral-500 dark:text-neutral-400",children:["Select a predefined job template to get started. Templates are stored as Nomad Variables under"," ",e.jsx("code",{className:"rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-mono dark:bg-neutral-800",children:"nomad/job-templates/"}),"."]})]}),e.jsxs("fieldset",{disabled:!a,className:"space-y-5",children:[e.jsx("div",{className:"grid gap-4 sm:grid-cols-2 lg:grid-cols-3",children:m.map(t=>e.jsxs("label",{onClick:()=>h(t.id),className:g("relative flex cursor-pointer flex-col rounded-lg border-2 p-4 transition-all",a===t.id?"border-primary-500 bg-primary-50 ring-1 ring-primary-500 dark:bg-primary-900/20":"border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600"),children:[e.jsx("input",{type:"radio",name:"template",value:t.id,checked:a===t.id,onChange:()=>h(t.id),className:"sr-only"}),e.jsxs("div",{className:"flex items-start justify-between",children:[e.jsx("span",{className:g("text-sm font-semibold",a===t.id?"text-primary-700 dark:text-primary-300":"text-neutral-900 dark:text-neutral-100"),children:t.name}),t.isDefault&&e.jsx("span",{className:"inline-flex shrink-0 items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300",children:"Default"})]}),e.jsx("p",{className:"mt-2 line-clamp-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400",children:t.description}),a===t.id&&e.jsx("div",{className:"absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-white",children:e.jsx("svg",{className:"h-3 w-3",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:3,d:"M5 13l4 4L19 7"})})})]},t.id))}),e.jsxs("div",{className:"flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-700",children:[e.jsx(b,{variant:"ghost",onClick:()=>r("/jobs/run"),children:"Cancel"}),e.jsx(b,{variant:"primary",onClick:y,disabled:!a,children:"Apply Template"})]})]})]})}export{I as TemplateSelectPage};
//# sourceMappingURL=template-select-page-Bz0nxLQ8.js.map
