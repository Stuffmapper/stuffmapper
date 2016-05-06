<<<<<<< HEAD
# stuffmapper
Stuffmapper Server, Web App, and Mobile App build in JavaScript

##Server Setup
---

This is just one of many ways to set up an ideal workflow to easily develop features without worrying about the containers, servers, or virtual machines.

###Prerequisites:
---

1. A .iso of Ubuntu (14.04+, preferably LTS)
2. VirtualBox
3. OS X, Linux, Cygwin, or the latest version of Windows 10 with Bash
4. A Github account with access to this repo
5. Sublime Text 2/3 with Package Control or Atom (you can really use whichever you want, but this README will cover a workflow involving at least these two editors)

###The Virtual Machine Workflow
---

If you already have a workflow similar to the one described here, or you just want to set up the server, then move down to the XXX1 section.  Otherwise, let's begin!

The first thing we are going to do is create a sort of Clean Base for your future servers.  This isn't really a requirement, but this can really help future proof your workflow.  It's also great for a backup plan in case your virtual machine breaks.  If you already have a "Clean Base" of Ubuntu 14.04+, then skip ahead to XXX2.

Fire up VirtualBox and create a new virtual machine.  Call it something along the lines of "CLEAN BASE DO NOT USE" to make sure you don't use this machine for development.  This is the machine that you will use to create all future virtual machines.  Set it to Linux/Ubuntu and give it a comfortable amount of RAM. (up to 2048GB if you can spare it)

Choose the Create a virtual hard disk now option and click create.

Give this VM around 16GB of hard disk space and make sure to choose VDI as the image file type and choose "Dynamically allocated" to ensure that your VMs don't use up all available space on your hard drive.  Click create.

Click on the Settings button and then click on the System tab.  Click the Processor tab and crank up the CPU Processors to as high as you can.  Click the Display tab and crank up the video memory as high as you can.  Also check the Enable 3D Acceleration option.  Click the Storage tab and click the Node in the tree pane on the left that says "Empty" just underneath "Controller: IDE".  There will be a little button that looks like a CD to the left of the Optical Drive drop down.  Click that and select "Choose Virtual Optical Disk File...".  Browse to your Ubuntu .iso and select the .iso.

Click the Network tab and go to Port Forwarding.  Make sure it looks something like the following:


| Name         	| Protocol 	| Host IP 	| Host Port 	| Guest IP 	| Guest Port 	|
|--------------	|----------	|---------	|-----------	|----------	|------------	|
| ssh          	| TCP      	|         	| 3022      	|          	| 22         	|

The Host Port can be anything as long as it does not conflict with any other application.

Make your way out of the settings by pressing the OK button when necessary and then press the Start button in the VirtualBox window.

Go through the motion of setting up Ubuntu.  Once logged in, install the openssh server with apt-get:
`sudo apt-get install openssh-server -y`
then proceed to update the VM:
`sudo apt-get update && sudo apt-get upgrade -y`
restart the VM and check if there are additional upgrade by running the previous command.  If anything installs, then restart the VM again.

Once you are logged back into the machine and it is fully up to date, then click Devices in the menubar and select the menu item "Insert Guest Additions CD Image...".  If you are running a GUI (Unity/Gnome/Mate/etc.), then a window will pop up asking if you would like to run the contents of the CD.  Click run, provide your password, and let it work things out.  Once it is finished, press return and restart your virtual machine.  Things should be much, much faster.

TO BE CONTINUED

| Name         	| Protocol 	| Host IP 	| Host Port 	| Guest IP 	| Guest Port 	|
|--------------	|----------	|---------	|-----------	|----------	|------------	|
| http         	| TCP      	|         	| 3080      	|          	| 80         	|
| https        	| TCP      	|         	| 3443      	|          	| 443        	|
| ionic        	| TCP      	|         	| 8100      	|          	| 8100       	|
| ionic helper 	| TCP      	|         	| 35729     	|          	| 35729      	|
| node         	| TCP      	|         	| 3000      	|          	| 3000       	|
| node ssl     	| TCP      	|         	| 3001      	|          	| 3001       	|
| ssh          	| TCP      	|         	| 3022      	|          	| 22         	|



The Host Ports can really whatever you want, as long as you register it as a port that doesn't require administrative privileges.
=======
# stuffmapper
Stuffmapper Server, Web App, and Mobile App build in JavaScript

##Server Setup
---

This is just one of many ways to set up an ideal workflow to easily develop features without worrying about the containers, servers, or virtual machines.

###Prerequisites:
---

1. A .iso of Ubuntu (14.04+, preferably LTS)
2. VirtualBox
3. OS X, Linux, Cygwin, or the latest version of Windows 10 with Bash
4. A Github account with access to this repo
5. Sublime Text 2/3 with Package Control or Atom (you can really use whichever you want, but this README will cover a workflow involving at least these two editors)

###The Virtual Machine Workflow
---

If you already have a workflow similar to the one described here, or you just want to set up the server, then move down to the XXX1 section.  Otherwise, let's begin!

The first thing we are going to do is create a sort of Clean Base for your future servers.  This isn't really a requirement, but this can really help future proof your workflow.  It's also great for a backup plan in case your virtual machine breaks.  If you already have a "Clean Base" of Ubuntu 14.04+, then skip ahead to XXX2.

Fire up VirtualBox and create a new virtual machine.  Call it something along the lines of "CLEAN BASE DO NOT USE" to make sure you don't use this machine for development.  This is the machine that you will use to create all future virtual machines.  Set it to Linux/Ubuntu and give it a comfortable amount of RAM. (up to 2048GB if you can spare it)

Choose the Create a virtual hard disk now option and click create.

Give this VM around 16GB of hard disk space and make sure to choose VDI as the image file type and choose "Dynamically allocated" to ensure that your VMs don't use up all available space on your hard drive.  Click create.

Click on the Settings button and then click on the System tab.  Click the Processor tab and crank up the CPU Processors to as high as you can.  Click the Display tab and crank up the video memory as high as you can.  Also check the Enable 3D Acceleration option.  Click the Storage tab and click the Node in the tree pane on the left that says "Empty" just underneath "Controller: IDE".  There will be a little button that looks like a CD to the left of the Optical Drive drop down.  Click that and select "Choose Virtual Optical Disk File...".  Browse to your Ubuntu .iso and select the .iso.

Click the Network tab and go to Port Forwarding.  Make sure it looks something like the following:


| Name         	| Protocol 	| Host IP 	| Host Port 	| Guest IP 	| Guest Port 	|
|--------------	|----------	|---------	|-----------	|----------	|------------	|
| ssh          	| TCP      	|         	| 3022      	|          	| 22         	|

The Host Port can be anything as long as it does not conflict with any other application.

Make your way out of the settings by pressing the OK button when necessary and then press the Start button in the VirtualBox window.

Go through the motion of setting up Ubuntu.  Once logged in, install the openssh server with apt-get:
`sudo apt-get install openssh-server -y`
then proceed to update the VM:
`sudo apt-get update && sudo apt-get upgrade -y`
restart the VM and check if there are additional upgrade by running the previous command.  If anything installs, then restart the VM again.

Once you are logged back into the machine and it is fully up to date, then click Devices in the menubar and select the menu item "Insert Guest Additions CD Image...".  If you are running a GUI (Unity/Gnome/Mate/etc.), then a window will pop up asking if you would like to run the contents of the CD.  Click run, provide your password, and let it work things out.  Once it is finished, press return and restart your virtual machine.  Things should be much, much faster.

TO BE CONTINUED

| Name         	| Protocol 	| Host IP 	| Host Port 	| Guest IP 	| Guest Port 	|
|--------------	|----------	|---------	|-----------	|----------	|------------	|
| http         	| TCP      	|         	| 3080      	|          	| 80         	|
| https        	| TCP      	|         	| 3443      	|          	| 443        	|
| ionic        	| TCP      	|         	| 8100      	|          	| 8100       	|
| ionic helper 	| TCP      	|         	| 35729     	|          	| 35729      	|
| node         	| TCP      	|         	| 3000      	|          	| 3000       	|
| node ssl     	| TCP      	|         	| 3001      	|          	| 3001       	|
| ssh          	| TCP      	|         	| 3022      	|          	| 22         	|



The Host Ports can really whatever you want, as long as you register it as a port that doesn't require administrative privileges.
>>>>>>> 165b547c0bf52b4867c71861d2922c16df238a50
