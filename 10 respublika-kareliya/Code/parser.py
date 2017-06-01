from bs4 import BeautifulSoup
import csv
import os
import csv
import codecs
import requests


directory = "c:\Workdir2\EGE\\10 - karelia\karelia\Русский-язык-2016"
files = os.listdir(directory)
filelist = list(filter(lambda x: x.endswith('.html'), files))
for file in filelist:
    municipal_name = str(file).split(".html")[0]
    with open(os.path.join(directory, file), 'rb') as htmlfile:
        text = htmlfile.read().decode()
        bs_table = BeautifulSoup(text, "lxml").find("table", attrs= {"id":"stat_table"})
        bs_rows = bs_table.find_all("tr")
        header = []
        school_results = []
        for i, col in enumerate(bs_rows[0].find_all("td")):
            if i == 3 or i == 4:
                header.append("Количество ({0})".format(col.text))
                header.append("% ({0})".format(col.text))
            else:
                header.append(col.text)
        for i, row in enumerate(bs_rows):
            if i < 2:
                continue
            if "Итого" in str(row):
                break;
            school_results.append(list(z.text for z in row.find_all("td")))


csv.register_dialect('customcsv', delimiter=',', quoting= csv.QUOTE_NONE, quotechar='"', escapechar='\\')
with open(municipal_name + ".csv", "w", encoding='utf-8', newline='') as f:
    writer = csv.writer(f, 'customcsv')
    writer.writerow(header)
    writer.writerows(school_results)