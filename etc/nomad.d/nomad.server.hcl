:~$ cat /etc/nomad.d/nomad.hcl
data_dir = "/opt/nomad/data"
bind_addr = "0.0.0.0"

server {
  enabled = true
  bootstrap_expect = 1
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
ui {
  enabled = true
}