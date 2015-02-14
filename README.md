# Google Autocomplete Archive

---

MFA Design and Technology, Parsons The New School for Design

Thesis Studio 2

Faculty: Sven Travis and Loretta Wolozin

Spring, 2015

[Project link here](http://54.204.173.108:3011)

---

## Process

* I started by automating the autocomplete call — which means changing all from front-end (javaScript) to back end (nodeJS)
* The current script runs on a server and calls the autocomplete for each letter of the latin alphabet (A-Z) and for each of 7 Google products (Web, Images, Youtube, News, Products, Books, and Recipes) every 24 hours
* Data is saved in a mongoDB database *and* as JSON files


## To do

* Explore other languages
	* How to loop through non-latin alphabets?
* Create scraper to store link to the first results of each search
	* Save images or just links?