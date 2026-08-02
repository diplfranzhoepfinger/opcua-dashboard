OPEN62541_DIR = ../open62541
BUILD_DIR = $(OPEN62541_DIR)/build

CC = gcc
CFLAGS = -Wall -Wextra -O2 -std=c99 \
         -I$(OPEN62541_DIR)/include \
         -I$(OPEN62541_DIR)/plugins/include \
         -I$(OPEN62541_DIR)/arch \
         -I$(OPEN62541_DIR)/arch/posix \
         -I$(OPEN62541_DIR)/deps \
         -I$(OPEN62541_DIR)/src \
         -I$(BUILD_DIR)/src_generated \
         -I$(BUILD_DIR)/src_generated/open62541 \
         $(shell pkg-config --cflags libwebsockets)

LDFLAGS = $(BUILD_DIR)/bin/libopen62541.a \
          $(shell pkg-config --libs libwebsockets) \
          -lssl -lcrypto \
          -lpthread -lm

TARGET = bin/opcua-server

SRC = src/server.c

.PHONY: all clean run

all: $(TARGET)

bin:
	mkdir -p bin

$(TARGET): $(SRC) | bin
	$(CC) $(CFLAGS) -o $@ $< $(LDFLAGS)

run: $(TARGET)
	./$(TARGET)

clean:
	rm -f $(TARGET)
