#!/usr/bin/env bash

function PartOfSwarm {
    NodeStatus="$(sudo docker node ls 2>&1)"
    NodeErrorNoManager="Worker nodes can't be used to view or modify cluster state"
    NodeErrorNoSwarm="docker swarm init"

    if [[ $NodeStatus = *"$NodeErrorNoManager"* ]]
    then
        NodePartOfSwarm=true
    elif [[ $NodeStatus = *"$NodeErrorNoSwarm"* ]]
    then
        NodePartOfSwarm=false
    else
        NodePartOfSwarm=true
    fi
}

function PingApi {
    echo "Pinging API on $1:3000..."
    PingResponse="$(nc -vz $1 3000 2>&1)"

    if [[ $PingResponse = *"succeeded"* ]]
    then
        SwarmAlive=true
    elif [[ $PingResponse = *"Connection refused"* ]]
    then
        SwarmAlive=false
    fi
}

function RequestJoinToken {
    echo "Requesting join-token from api.."
    RequestResponse="$(curl -s -X GET pimanager1.local:3000/api/device/joinToken 2>&1)"

    pref='*: "*'
    suffix='" }'
    #removing text before join-token:
    FetchJoinToken=${RequestResponse#$pref}
    #removing text after join-token:
    FetchJoinToken=${FetchJoinToken%$suffix}
}

function InitialiseSwarm {
    echo "Initialising swarm..."
    InitialiseSwarmRasponse="$(sudo docker swarm init 2>&1)"

    pref="*command:"
    suffix="To*"

    #removing text before join-token:
    JoinToken=${InitialiseSwarmRasponse#$pref}
    #removing text after join-token:
    JoinToken=${JoinToken%$suffix}
    # remove leading whitespace characters
    JoinToken="${JoinToken#"${JoinToken%%[![:space:]]*}"}"
    # remove trailing whitespace characters
    JoinToken="${JoinToken%"${JoinToken##*[![:space:]]}"}"
}


function RunPythonApp {

    #fetching hostname:
    hostname=$(hostname -s)

    if [[ $hostname = *"manager"* ]]
    then
        role="manager"
    else
        role="worker"
    fi

    #checking if join-token needs to be registered
    if (($1 > 0))
    then
        echo "Launching python app with join-token"
        sudo docker run --privileged --net="host" -e HOSTNAME=$hostname -e ROLE=$role -e JOINTOKEN="$JoinToken" whek/python-test
    else
        echo "Launching python app"
        sudo docker run --privileged --net="host" -e HOSTNAME=$hostname -e ROLE=$role -e JOINTOKEN="" whek/python-test
    fi
}
##************************
##**** Main loop *********
##************************

function MainLoopFromPing {
    #resuming main loop:
    PingApi pimanager1.local

    if [ "$SwarmAlive" = true ] ; then
        echo "Swarm detected!"
        RequestJoinToken

        echo "Join token fetched... Joining swarm"
        sudo $FetchJoinToken

        RunPythonApp 0

    else
        echo "No swarm detected!"
        InitialiseSwarm

        #installing git
        echo "Cloning docker-compose file from git..."
        sudo apt-get install -y git

        #cloning docker-compose:
        sudo rm -rf /tmp/sis
        sudo git clone https://github.com/xrgman/SIS.git /tmp/sis

        #Running database and node-server:
        sudo mkdir -p /app/data
        sudo docker stack deploy -c /tmp/sis/docker-compose.yml sis_data

        #waiting till api is online
        while true
        do
            PingApi 127.0.0.1

            if [ "$SwarmAlive" = true ] ; then
                break
            fi

            sleep 5
        done

        echo "Api running..."

        #running angular website:
        #To-Do: make website...

        #running python app with join-token:
        RunPythonApp 1
    fi
}

#checking if docker is installed:
if hash docker 2>/dev/null; then
    echo "Docker already installed on this machine"

    #checking if node is part of the swarm:
    PartOfSwarm

    if [ "$NodePartOfSwarm" = true ] ; then
        echo "Node part of the swarm"
        RunPythonApp 0
    else
        echo "Node not yet part of the swarm"
        MainLoopFromPing
    fi
else
    echo "Docker not yet installed."
    echo "Installing docker..."

    #installing docker:
    curl -sSL https://get.docker.com | sh
    echo "Docker successfully installed!"

    #pinging Api to see if there is a swarm up:
    MainLoopFromPing
fi


