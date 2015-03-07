# Autocomplete Archive Documentation

MFA Design and Technology, Parsons The New School for Design

**Thesis Studio 2** faculty: Sven Travis and Loretta Wolozin  
**Data Structures** faculty: Aaron Hill

Spring, 2015

This is an ongoing documentation of my [Google Autocomplete Archive project](https://github.com/gianordoli/autocomplete_archive/).

---
	
## Documentation

### Getting Data from Different Countries

I've been experimenting with a sort of [undocumented Google autocomplete "API"](http://shreyaschand.com/blog/2013/01/03/google-autocomplete-api/) since [last semester](https://gabrielmfadt.wordpress.com/category/thesis-1/). To create the Autocomplete scraper, I first had to automate the calls and change all the front-end (javaScript) to back end (nodeJS).

Next I started to experiment with calls to different languages — the *hl* parameter. I found a list of all [Google Language Codes](https://sites.google.com/site/tomihasa/google-language-codes) and included them as a third level in my scraping loop (languages > services > languages).

However, changing the language parameter still retrieves results from the worldwide domain, *google.com*. The difference is that it will return predictions based on searches made on a different language. But that is quite different from predictions per country, which is what I was looking for.

None of the urls I was using — *http://suggestqueries.google.com/complete/search?* and *http://clients1.google.com/complete/search* — allowed me to change the domain. I started to inspect the network calls in the browser console and found out that I could simply do *https://www.google.com/complete/search?* and replace the *google.com* to make calls to any of the 188 [Google domains](http://en.wikipedia.org/wiki/List_of_Google_domains). The url request format is:

https://www.**domain**/complete/search?  
&q=**search term**  
&ds=**service ds (img, yt, n, bo, sh, r)**  
&hl=**language code**  
&client=**firefox/toolbar (JSON/XML)**

Not all domains retrieved data, though. I ran the script a couple of times to see where it would break and double checked the domains on the browser. I ended up removing China ([google.cn](https://google.cn), [g.cn](https://g.cn)) and Iran ([google.ir](https://google.ir)) — both censored —, besides British Indian Ocean Territory ([google.io](https://google.io)) and French Guiana ([google.gf](https://google.gf)) — both redirect to google.com.


### Language Limitations

The new domains introduced a new challenge in the project: how to get and store data with non-latin characters? I changed part of the script to read the text encoding in the server's response and convert the data. Later I found out that simply setting the request encoding to *null* would [handle special characters](http://stackoverflow.com/questions/12040643/nodejs-encoding-using-request).

Still, I could not *make* calls in languages which script I'm not familiar with, because my input is based on the latin alphabet (letters A-Z). In addition to that, some domains provide search options in more than one language. Lebanon, for instance, allows users to choose between English, French, Arabic, and Armenian. Autocomplete predictions vary from one another, which is an interesting cultural aspect, but also adds complexity to the data acquisition.

To make things simpler, I based my script on this list of [languages per Google TLD (top-level domain)](https://www.distilled.net/blog/uncategorized/google-cctlds-and-associated-languages-codes-reference-sheet/). That might not be accurate, because the main language in some countries not always corresponds to the language used on the web. For example, Lebanon's main language is Arabic, but people use French or English online. South Africa searches in English, though the most spoken language is Afrikaans. However, double-checking each of these cases would not be feasible at this stage of the project.

As a consequence of the complexity and research effort posted by these challenges, I limited my list to the main languages indicated in the TLDs list. I crossed the languages with a [list of languages by writing system](http://en.wikipedia.org/wiki/List_of_languages_by_writing_system) and filtered out all the ones that are not based on the latin script. This was done manually, due to inconsistencies — different spelling for country names and languages —  accros the sources. The final list includes 147 domains.


### Data Structure

After solving all the issues related to language, I set up a way to store the data on a daily basis. The script that performs the automated calls is written in [Node.JS](http://nodejs.org/). The calls are made using the [request](https://github.com/request/request) module. As it loops through each country, the algorithm saves the results both in a [JSON](http://json.org/) file and a [mongoDB](http://www.mongodb.org/) database. The latter will also be utilised in the data retrieving, on the second part of this project. The former is just a way to keep an accessible backup.

#### mongoDB

the structure of each mongoDB document is as follows: 

```
  {
    "date": "2015-02-19T02:50:26.452Z",
    "service": "web",
    "domain": "google.ad",
    "language": "ca",
    "letter": "a",
    "results": [
      "amazon",
      "ara",
      "as",
      "atri",
      "aliexpress",
      "atrapalo",
      "abacus",
      "abc",
      "antena 3",
      "aeat"
    ]
  },
```

Besides the array of autocomplete predictions stored inside each document, there is no other nested structure in the database. Two are the reasons for this choice. First, not all letter inputs return predictions. This is particularly true in less popular services like Google Recipes — see [Google Supersearch](http://54.204.173.108/parsons/thesis_1/google_supersearch/) for a live demonstration. Second, I want to able to sort and filter this data by as many parameters as possible in the future. Keeping the information all in one level seemed to me the less complicated way to do it.


#### JSON

The JSON files are named following the format *data_google_ad_1424314259065.json*, where *google_ad* stands for the [google.ad](https://google.ad) (Andorra) domain, and the number is the request [timestamp in javaScript format](http://www.w3schools.com/jsref/jsref_gettime.asp).

Each file stores all results for a TLD in a single day. For example, the above file includes the predictions based on all letters and all services for Google Andorra in February 18th, 2015.


### Technical Restrictions

#### Feb 15th

I first ran the complete script locally, on my Mac OSX 10.9, on February 15th, 2015. It took about 1 hour and 15 minutes to go through all 26,754 calls (26 letters x 7 services x 147 TLDs). 

While running the same script on a server, though, it broke halfway through. I tried a few different things over the next days, with no success. I ended up concluding that the server speed was such that it easilly exceeded the maximum frequency of calls determined by the API. So I kept it running locally and started over on February 18th.

#### Feb 18th

The app crashed a few times then, but simply running it back from where it stopped worked fine.

#### Feb 19th

While inspecting another crash, I found out that one of the domains, [google.nr](https://google.nr) (Naru) was not online — though it was on the day before. I added a few fallbacks to the script to make it skip to the next country in those cases. Which makes me wonder if some of these domains are simply obsolete: in spite of their existence, people just use [google.com](https://google.com).


#### Feb 20th

Had some more trouble with the script. This time it was clear that the Google server detected the automated calls. Trying to access the same address from my browser I got the message:

![Error](img/sorry.png)

I tried to change the script to use [phantomJS](http://phantomjs.org/) and simulate a user, instead of doing simple requests. A few hours later, while testing the calls via browser, I realized that the script wasn’t being blocked anymore. So I went back to the request script, this time adding a 2-minute delay in between the calls for each country. My guess is that the real problem is the frequency. So, spreading out the calls accross a longer period — about 6 hours — would prevent the script from being blocked.


#### Feb 22th

The script was not blocked by Google anymore. It takes about 5 hours and 20 minutes, so that should be a frequency low enough to not cause any trouble. I'm still having problems trying to make the app run automatically every day. I'm using 2 node modules, [forever](https://www.npmjs.com/package/forever) and [cron](https://github.com/ncb000gt/node-cron) to manage that, but it's not working 100%.

Having the JSON files as a bakcup has been useful. Since mongoDB doesn't have a GUI, it's hard to notice if something goes wrong. With the files, though, I can just take a look into the sequence of domains and check if everything is fine. Today, for instance, the script kept running after it reached the last country and had to be manually stopped.


#### Feb 23th

No problems with the scraping anymore! The script starts automatically everyday at 9 pm (2 am UTC time). Using [forever](https://www.npmjs.com/package/forever) and [cron](https://github.com/ncb000gt/node-cron).

I will take a look into the results now, to see how things change from day to day. Maybe it's not wort scraping on a daily basis.


#### March 1st

I started developing the app to query the autocomplete archive database [here](https://github.com/gianordoli/autocomplete_archive_search). It has been helpful to check the validity of some scraping so far:

* results doesn't seem to change that often in web and images as in youtube.
* queries in international languages doesn't seem to be working for *news, books, products,* and *recipes*. I compared the results in my database to the ones I get while typing. It seems that the request is in English. There might be a different way to specify the hl parameter that I don't know about. So I might not use these services in the final project.