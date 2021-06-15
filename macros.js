import React from 'react';
import { Link } from 'gatsby';

import Markdown from '@src/components/Markdown';

export function Install({install, command, cluster, location}) {
  return (
    <details>
      <summary>Install Telepresence with Homebrew/apt/dnf</summary>

      <p>You will need the following available on your machine:</p>
      <ul>
        <li><code>{ command }</code> command line tool (here's the <Link to={ install }>installation instructions</Link>).</li>
        <li>Access to your { cluster } cluster, with local credentials on your machine. You can test this by running <code>{ command } get pod</code> - if this works you're all set.</li>
      </ul>

      <InstallSpecific location={location}/>

    </details>
  );
}

export function InstallSpecific({location}) {
  return (
    <Markdown>{`
#### OS X

On OS X you can install Telepresence by running the following:

\`\`\`shell
brew install --cask osxfuse
brew install datawire/blackbird/telepresence-legacy
\`\`\`

#### Ubuntu 16.04 or later

Run the following to install Telepresence:

\`\`\`shell
curl -s https://packagecloud.io/install/repositories/datawireio/telepresence/script.deb.sh | sudo bash
sudo apt install --no-install-recommends telepresence
\`\`\`

If you are running another Debian-based distribution that has Python 3.5 installable as \`python3\`, you may be able to use the Ubuntu 16.04 (Xenial) packages. The following works on Linux Mint 18.2 (Sonya) and Debian 9 (Stretch) by forcing the PackageCloud installer to access Xenial packages.

\`\`\`shell
curl -sO https://packagecloud.io/install/repositories/datawireio/telepresence/script.deb.sh
sudo env os=ubuntu dist=xenial bash script.deb.sh
sudo apt install --no-install-recommends telepresence
rm script.deb.sh
\`\`\`

A similar approach may work on Debian-based distributions with Python 3.6 by using the Ubuntu 17.10 (Artful) packages.

#### Fedora 26 or later

Run the following:

\`\`\`shell
curl -s https://packagecloud.io/install/repositories/datawireio/telepresence/script.rpm.sh | sudo bash
sudo dnf install telepresence
\`\`\`

If you are running a Fedora-based distribution that has Python 3.6 installable as \`python3\`, you may be able to use Fedora packages. See the Ubuntu section above for information on how to invoke the PackageCloud installer script to force OS and distribution.

#### Arch Linux

Until we have a *correct and working* AUR package, please install from source. See [issue #135](https://github.com/telepresenceio/telepresence/issues/135) for the latest information.

#### Windows

See the [Windows support documentation](/reference/windows.html).

#### Install from source

On systems with Python 3.5 or newer, install into \`/usr/local/share/telepresence\` and \`/usr/local/bin\` by running:

\`\`\`shell
sudo env PREFIX=/usr/local ./install.sh
\`\`\`

Install the software from the [list of dependencies](/reference/install.html#dependencies) to finish.

Install into arbitrary locations by setting other environment variables before calling the install script. [See the install script](https://github.com/telepresenceio/telepresence/blob/master/install.sh) for more information. After installation you can safely delete the source code.

#### Other platforms

Don't see your favorite platform? [Let us know](https://github.com/telepresenceio/telepresence/issues/new) and we'll try to add it. Also try installing from source.
`}</Markdown>
  );
}

export function GettingStartedPart1({cluster}) {
  return (
    <Markdown>{`
### Debugging a service locally with Telepresence

Imagine you have a service running in a staging cluster, and someone reports a bug against it.
In order to figure out the problem you want to run the service locally... but the service depends on other services in the cluster, and perhaps on cloud resources like a database.

In this tutorial you'll see how Telepresence allows you to debug your service locally.
We'll use the \`telepresence\` command line tool to swap out the version running in the staging cluster for a debug version under your control running on your local machine.
Telepresence will then forward traffic from ${ cluster } to the local process.
`}</Markdown>
  );
}

export function GettingStartedPart2({deployment, command, cluster}) {
  return (
    <Markdown>{`
Once you know the address you can store its value (don't forget to replace this with the real address!):

\`\`\`console
$ export HELLOWORLD=http://104.197.103.13:8000
\`\`\`

And you send it a query and it will be served by the code running in your cluster:

\`\`\`console
$ curl $HELLOWORLD/
Hello, world!
\`\`\`

#### Swapping your deployment with Telepresence

**Important:** Starting \`telepresence\` the first time may take a little while, since ${ cluster } needs to download the server-side image.

At this point you want to switch to developing the service locally, replace the version running on your cluster with a custom version running on your laptop.
To simplify the example we'll just use a simple HTTP server that will run locally on your laptop:

\`\`\`console
$ mkdir /tmp/telepresence-test
$ cd /tmp/telepresence-test
$ echo "hello from your laptop" > file.txt
$ python3 -m http.server 8001 &
[1] 2324
$ curl http://localhost:8001/file.txt
hello from your laptop
$ kill %1
\`\`\`

We want to expose this local process so that it gets traffic from ${ cluster }, replacing the existing \`hello-world\` deployment.

**Important:** you're about to expose a web server on your laptop to the Internet.
This is pretty cool, but also pretty dangerous!
Make sure there are no files in the current directory that you don't want shared with the whole world.

Here's how you should run \`telepresence\` (you should make sure you're still in the \`/tmp/telepresence-test\` directory you created above):

\`\`\`console
$ cd /tmp/telepresence-test
$ telepresence --swap-deployment hello-world --expose 8000 \
--run python3 -m http.server 8000 &
\`\`\`

This does three things:

* Starts a VPN-like process that sends queries to the appropriate DNS and IP ranges to the cluster.
* \`--swap-deployment\` tells Telepresence to replace the existing \`hello-world\` pod with one running the Telepresence proxy. On exit, the old pod will be restored.
* \`--run\` tells Telepresence to run the local web server and hook it up to the networking proxy.

As long as you leave the HTTP server running inside \`telepresence\` it will be accessible from inside the ${ cluster } cluster.
You've gone from this...

<div class="mermaid">
graph RL
subgraph ${ cluster } in Cloud
server["datawire/hello-world server on port 8000"]
end
</div>

...to this:

<div class="mermaid">
graph RL
subgraph Laptop
code["python HTTP server on port 8000"]---client[Telepresence client]
end
subgraph ${ cluster } in Cloud
client-.-proxy["Telepresence proxy, listening on port 8000"]
end
</div>

We can now send queries via the public address of the \`Service\` we created, and they'll hit the web server running on your laptop instead of the original code that was running there before.
Wait a few seconds for the Telepresence proxy to startup; you can check its status by doing:

\`\`\`console
$ ${ command } get pod | grep hello-world
hello-world-2169952455-874dd   1/1       Running       0          1m
hello-world-3842688117-0bzzv   1/1       Terminating   0          4m
\`\`\`

Once you see that the new pod is in \`Running\` state you can use the new proxy to connect to the web server on your laptop:

\`\`\`console
$ curl $HELLOWORLD/file.txt
hello from your laptop
\`\`\`

Finally, let's kill Telepresence locally so you don't have to worry about other people accessing your local web server by bringing it to the foreground and hitting Ctrl-C:

\`\`\`console
$ fg
telepresence --swap-deployment hello-world --expose 8000 --run python3 -m http.server 8000
^C
Keyboard interrupt received, exiting.
\`\`\`

Now if we wait a few seconds the old code will be swapped back in.
Again, you can check status of swap back by running:

\`\`\`console
$ ${ command } get pod | grep hello-world
\`\`\`

When the new pod is back to \`Running\` state you can see that everything is back to normal:

\`\`\`console
$ curl $HELLOWORLD/file.txt
Hello, world!
\`\`\`

----

> **What you've learned:** Telepresence lets you replace an existing deployment with a proxy that reroutes traffic to a local process on your machine.
> This allows you to easily debug issues by running your code locally, while still giving your local process full access to your staging or testing cluster.

----

Now it's time to clean up the service:
`}</Markdown>
  );
}

export function TutorialFooter({title, path, baseUrl}) {
  return (
      <Markdown>{`
**Still have questions? Ask in our [Slack chatroom](https://a8r.io/slack) or [file an issue on GitHub](https://github.com/telepresenceio/telepresence/issues/new).**
`}</Markdown>
  );
}
