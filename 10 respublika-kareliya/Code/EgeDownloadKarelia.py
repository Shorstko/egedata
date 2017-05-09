#забираем все html-страницы с результатами ЕГЭ по годам, предметам, муниципалитетам
#структура: 1) заглавная страница со ссылками в формате "Название_предмета - год"
#на странице предмета - ссылки на данные по муниципалитетам
#исключение - "Распределение баллов", там парсится flash-компонент
#проблемы: 1) у 2016 года нет отдельной страницы;
# 2) есть несколько кириллических ссылок, их конвертируем функцией asciify_url

import urllib.request
from bs4 import BeautifulSoup
import csv
import os
import re

#urllib не открывает non-ascii адреса, конвертируем кириллицу в ascii
#исходная функция была сложнее и под python 2:
# https://blog.elsdoerfer.name/2008/12/12/opening-iris-in-python/
def asciify_url(url, force_quote=False):
    parts = urllib.parse.urlsplit(url)
    if not parts.scheme or not parts.netloc:
        # apparently not an url
        return url

    # idna-encode domain
    hostname = parts.hostname.encode('idna')

    # UTF8-quote the other parts. We check each part individually if
    # if needs to be quoted - that should catch some additional user
    # errors, say for example an umlaut in the username even though
    # the path *is* already quoted.
    def quote(s, safe):
        s = s or ''
        # Triggers on non-ascii characters - another option would be:
        #     urllib.quote(s.replace('%', '')) != s.replace('%', '')
        # which would trigger on all %-characters, e.g. "&".
        if s.encode('ascii', 'replace') != s or force_quote:
            return urllib.parse.quote(s.encode('utf8'), safe=safe)
        return s
    username = quote(parts.username, '')
    password = quote(parts.password, safe='')
    path = quote(parts.path, safe='/')
    query = quote(parts.query, safe='&=')

    # put everything back together
    netloc = hostname
    if username or password:
        netloc = '@' + netloc
        if password:
            netloc = ':' + password + netloc
        netloc = username + netloc
    if parts.port:
        netloc += ':' + str(parts.port)
    return urllib.parse.urlunsplit([
        parts.scheme, netloc.decode('ascii'), path, query, parts.fragment])


directory = "karelia"
if not os.path.exists(directory):
    os.makedirs(directory)

mainstat = urllib.request.urlopen('http://ege.karelia.ru/Stats.aspx').read()
matches = BeautifulSoup(mainstat, "lxml").find_all('div', attrs={'class': 'sitemap', 'id': 'ctl01_ChildPageMenu1_SiteMap1'})
#print (matches)
urls = matches[0].find_all('a')
first_level_urls = list()
year = ""
for url in urls:
    try:
        dig = int(url.get("title")[0])
        year = re.sub("[^0-9]","",url.get("title"))
        print (year)
    except:
        title = str(url.get("title"))
        if "2" in title and len(year) > 0:
            title = re.sub("[0-9]","", title)
        #костыль для 2016 года
        if "2016" in title and len(year) == 0:
            year = "2016"
        title += (" " + year)

        # временно
        # if year == "2016" or ("2015" in title or "2014" in title or "2013" in title
        #                       or "2012" in title or "2011" in title or "2010" in title):
        #     continue

        title = re.sub("[ ]{2,}", " ", title).strip()
        title = title.replace(" ", "-")
        url = "http://ege.karelia.ru" + str(url.get('href'))
        curdir = os.path.join(directory, title)
        if os.path.exists(curdir) == False:
            os.mkdir(curdir)

        unicodeurl = asciify_url(url)
        req = urllib.request.urlopen(unicodeurl)
        stat = req.read()

        if ("распределение" in title.lower()) == False:
            try:
                match = BeautifulSoup(stat, "lxml").find_all('table', attrs={'id': 'stat_table'})[0]
                urls = match.find_all('a', attrs={'class': 'sitelink-1'})
                print(urls)
                for url in urls:
                    fullurl = "http://ege.karelia.ru" + "//" + str(url.get('href'))
                    name = url.text
                    htmlname = name + ".html"
                    urllib.request.urlretrieve(fullurl, curdir + "//" + htmlname)
            except:
                continue
        else:
            try:
                match = BeautifulSoup(stat, "lxml").find_all('select', attrs={'name': 'ctl01$mainContent$ctl00$specs'})[
                    0]
                options = BeautifulSoup(stat, "lxml").find_all('option')
                # собираем адрес вида http://ege.karelia.ru/openchartquery.aspx?spec=1,2014
                for option in options:
                    fullurl = "http://ege.karelia.ru/openchartquery.aspx?spec=" + option.get('value') + "," + year
                    name = option.text
                    htmlname = name + ".html"
                    urllib.request.urlretrieve(fullurl, curdir + "//" + htmlname)
            except:
                continue