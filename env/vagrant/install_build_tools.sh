#!/usr/bin/env bash
# Installs build tool essentials

apt-get update

apt-get install -y build-essential git curl wget vim nodejs nodejs-legacy npm python \
                        postgresql libpq-dev redis-server linux-tools-generic lib32z1 \
                        lib32ncurses5 lib32bz2-1.0 g++
