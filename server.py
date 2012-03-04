#!/usr/bin/env python
#coding: utf-8

"""
Serves files out of its current directory.
Doesn't handle POST requests.
"""
import SocketServer
import SimpleHTTPServer
from urlparse import urlparse, parse_qs
import os

ADDRESS = '' #any
PORT = 8080
STORAGEDIR = 'userfiles'


def getfile():
    """returns a file to the client"""
    return 'getfile'


class CustomHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):

    def do_GET(self):
        data = urlparse(self.path)
        if data.path == '/listfiles':
            #list user source code files stored on the server
            files = '\n'.join(os.listdir(STORAGEDIR))
            self.send_response(200) #OK
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(files)
            return
        elif data.path == '/getfile':
            #sends the sourcecode file to the client
            self.send_response(200) #OK
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            query = parse_qs(data.query)
            filename = query['name'][0]
            if not filename.endswith('.splaf'):
                filename += '.splaf'
            try:
                file = open(STORAGEDIR + os.sep + filename, 'r')
                filedata = file.read()
                file.close()
            except IOError:
                self.wfile.write('Error! Could not get file %s!' % filename)
            else:
                self.wfile.write(filedata)
            return
        elif data.path == '/submitfile':
            #gets the source code file from the client
            self.send_response(200) #OK
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            query = parse_qs(data.query)
            filename = query['name'][0]
            filedata = query['data'][0]
            if not filename.endswith('.splaf'):
                filename += '.splaf'
            try:
                file = open(STORAGEDIR + os.sep + filename, 'w')
                file.write(filedata)
                file.close()
            except IOError:
                self.wfile.write('There was an error while trying to store '+\
                    'file %s on the server!' % filename)
            else:
                self.wfile.write('File %s correctly stored on the server.' %
                    filename)
            return
        elif data.path.endswith(('.html', '.js', '.css')):
            #serve files by following self.path from current working directory
            SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)
            return
        else:
            self.send_error(404) #not found

server = SocketServer.ThreadingTCPServer((ADDRESS, PORT), CustomHandler)
print "Serving at port", PORT
server.serve_forever()
