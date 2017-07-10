
import os
import urllib.request
import requests
import shutil

# Download the file from `url` and save it locally under `file_name`:
directory = os.path.join(os.getcwd(), "downloaded")
if os.path.exists(directory) == False:
    os.mkdir(directory)

def DownloadFile(url, path, id):
    r = requests.get(url)
    #print(r.headers['content-type'], r.headers['Content-Disposition'].encode("iso8859-1").decode(), " size: ",
    #      len(r.content))
    filename, fileext = os.path.splitext(r.headers['Content-Disposition'].encode("iso8859-1").decode())
    filename = filename.split("\"")[1]
    fileext = fileext.replace("'", "").replace("\"", "")
    name = os.path.join(path, filename) + fileext
    i = 1
    while os.path.exists(name):
        name = os.path.join(path, filename) + "(" + str(i) + ")" + fileext
        i+= 1
    with open(name, 'wb') as out_file:
        out_file.write(r.content)
        print (id, " ", name)


for i in range(401, 600):
    url = "http://ege35.edu35.ru/index.php?option=com_attachments&task=download&id=%d" % i
    try:
        DownloadFile(url, directory, i)
    except:
        print(i)

#http://unro.minjust.ru/Reports/55851701.pdf