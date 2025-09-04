# Simple node openai console chat


## Logging

Logs conversations to ~/.chat_log 


## Setup

```bash 
git clone https://github.com/stw/jschat.git jschat
cd jschat
npm install
```

Add your OPENAI_API_KEY key to .env

```
node chat.js
```


## tmux setup 

```tmux
bind-key -r l run-shell "tmux splitw -l 25% 'cd ~/projects/ai/jschat ; node chat.js'"
```



