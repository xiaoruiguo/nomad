//client config

data_dir = "/opt/nomad/data"
bind_addr = "0.0.0.0"

client {
  enabled = true
  server_join {
    retry_join = ["x.x.x.x"]
  }
  cpu_total_compute = 2000
}

addresses {
  http = "0.0.0.0"
  rpc  = "0.0.0.0"
  serf = "0.0.0.0"
}

advertise {
  http = "x.x.x.x"
  rpc  = "x.x.x.x"
  serf = "x.x.x.x"
}

acl {
  enabled = true
}

plugin "raw_exec" {
  config {
    enabled = true
  }
}