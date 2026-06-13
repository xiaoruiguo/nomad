export interface JobTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  isDefault: boolean;
}

export const DEFAULT_JOB_TEMPLATES: JobTemplate[] = [
  {
    id: 'nomad/job-templates/default/hello-world',
    name: 'Hello World',
    description:
      'A simple job that runs a single task on a single node. This job uses the exec driver to run an HTTP server that responds with "Hello World!".',
    template: `job "hello-world" {
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
}`,
    isDefault: true,
  },
  {
    id: 'nomad/job-templates/default/actions',
    name: 'Actions',
    description:
      'A Redis management job demonstrating Nomad Actions. Includes actions for adding, listing, and deleting keys, as well as health checks and toggling persistence.',
    template: `job "redis-actions" {
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
}`,
    isDefault: true,
  },
  {
    id: 'nomad/job-templates/default/parameterized-job',
    name: 'Parameterized Job',
    description:
      'A parameterized job that can be dispatched multiple times with different payloads and metadata values.',
    template: `job "batch-processor" {
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
}`,
    isDefault: true,
  },
  {
    id: 'nomad/job-templates/default/service-discovery',
    name: 'Service Discovery',
    description:
      'One group registers a service while another discovers it. Demonstrates service registration and health checking.',
    template: `job "service-discovery" {
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
}`,
    isDefault: true,
  },
  {
    id: 'nomad/job-templates/default/variables',
    name: 'Variables',
    description:
      'An example of using Nomad Variables to configure a simple HTML page output.',
    template: `job "variables-example" {
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
          "<html><body><h1>Hello from {{env \"NOMAD_VAR_title\"}}</h1></body></html>"
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
}`,
    isDefault: true,
  },
];

export function formatTemplateLabel(path: string): string {
  const delimiter = path.lastIndexOf('/');
  let label = delimiter !== -1 ? path.slice(delimiter + 1) : path;
  return label.charAt(0).toUpperCase() + label.slice(1).replace(/-/g, ' ');
}
