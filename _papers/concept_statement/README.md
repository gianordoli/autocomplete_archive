# Concept Statement

Gabriel Gianordoli

Thesis Studio 2

Professors Sven Travis and Loretta Wolozin

February 16th, 2014


## Idea and Form

In digital systems, we access information through databases and software. Graphical interfaces help make this process friendly and seamless. However, they might also prevent us from understanding how these systems actually work.

This project will build an archive of daily Google Autocomplete predictions, for multiple countries and products — web, Google Images, Youtube, etc. Users can have access to this information both through a physical and a digital output. The former will be a collection of printed books using curated subsets of this data — predictions by country, letter, day, service, etc. The latter will be a web app that allows for multiple ways to retrieve, sort, and filter the database.

The purpose is that by experimenting with — and experiencing — this data in different forms, users might question their own knowledge of it.
<!-- Ah – ok. Multiple perspectives; critical consumption. Your hint in paragraph 1 is quite general, and, I think a bit misleading about outcome: eg, we may never know how algorithms differ, or how format, amount of information have been systematically scraped and delivered..but we will have a chance to consider and reconsider how varying resources and forms influences fwhat we get, what we come to know…etc. -->


## Data: Autocomplete and Trends

Autocomplete is not designed as a way to access Google’s most searched terms. A different Google product plays this role: Trends. Launched in 2002, the website provides multiple filters to look up searching data: by country, period, category, and product. Though allowing for several combinations, the service is limited to a single option by filter. For instance, it is not possible to compare searches from two different countries. Also, Google does not provide an API to access the service, restraining access to the dataset to the website UI.

The Autocomplete service does not have an API either. However, it is possible to look up the network requests made by the browser whenever an user types something into the search box. That provides an easy way to tap into the parameters of the dataset request. With those, it is not hard to build an automated way to retrieve the list of predictions.

The limitation of this method, though, is that Autocomplete requires at least one character to return a prediction. This project adopts the bare minimum, looping through the letters from A to Z. This decision is not only a consequence of the technical limitations involved, though. It also reflects the purpose of building an archive that triggers associations with traditional ways of storing information — alphabetically, geographically, and chronological. Those methods will serve this project in its translation to familiar print forms later — dictionary, atlas, alphabet book, calendar, etc.
<!-- Can you contextualize each of these sections, letting your reader, fac, reviewer, future interested designer know how procedures (methodology) fit into project writ large: back end to interface to interaction model? -->


## Media: Print and Digital

Previous iterations of this project utilized: digital media, print media, and a combination of both. The first iterations, digital, lacked a capacity to evoke interest and critical view from users. Maybe because they shared the same medium as the original dataset. As a consequence, the next iteration was an ABC book (printed). The user feedback was satisfactory, with people commenting on the awkward juxtaposition between letters, half-naked celebrities, and puppies.

Because of this capacity to create an uncanny effect, print was chosen as the main medium for this project. Also, particular print forms evoke cultural associations that help users engage with the presented dataset — ABC books and education; dictionary and language; encyclopaedia and knowledge; etc.
<!-- This is really great analysis: connectivity between idea and possible forms. I suggest you push the “uncanny” observation a bit further…eg ? the unexpected assembly of data content and types evoked surprise and provoked questions…? Or some such.  -->

The latest iteration of this project tried to combine both media: users could access the data on a web page and print the results. The layout was set so that an instant book could be made out of a single sheet of paper.

However, this link between print and digital proved to be a problem. The print layout was not legible on screen and also set too many constraints to the user interaction. Besides, most users do not even have a printer anymore, which makes this approach even less useful.

Consequently, the planned outcomes for this project utilize print and digital media in separate forms. The intention is to fulfill user expectations about each media. Also, this will serve as an experiment on representing data across different platforms. What are the constraints and possibilities set by each one? How does the medium change the way users perceive a given dataset?
<!-- Great working design questions. And how can you gather data about how users perceive… -->


## Current Prototype

The two outcomes of this project rely on gathering data from Google Autocomplete first, in order to build the archive. Because of that, the current prototype focuses on a way to automate this process. The following are the steps currently in development:

1. Access the Autocomplete predictions from a server (back-end).
2. Request predictions based on a given set of terms — the latin alphabet.
3. Repeat the same set of terms for each Google product.
4. Store the results in a database.
5. Repeat steps 3 and 4 for different Google domains (countries).

Though a list of 189 Google domains is easily accessible, not all of them retrieve data. Some due to censorship — China and Iran —, some due to the use of a script other than latin. Part of the latter problem could be solved by implementing different alphabets. But still, non-alphabetical languages like mandarin would not work.

In addition to that, some domains provide search options in more than one language. Lebanon, for instance, allows users to choose between English, French, Arabic, and Armenian. Autocomplete predictions vary from one another, which is an interesting cultural aspect, but also adds complexity to the data acquisition.

A script to include non-latin languages can be implemented in future iterations. So far, the project is limited to countries in which the main language utilizes latin characters. For instance, Lebanon is not included, since its main language is Arabic.
<!-- G: this is a detailed analysis, with excellent connectivity between your idea and approach to form (your methodology). I especially appreciate how your interpretation of iterative design builds rationale for your approach. Although I understand that you are most definitely in design, I would ask you to (a) push expression of potential strategies to provoke the outcome(s): how users can be prompted, jolted, asked to weigh, sort, consider implications of multiple sources- however you want to express the possible outcomes  of your participants’ experience with each  and/or any combination of the output media you are designing. (b) clarify your purpose at the outset (see commret above).  Also, I am interested in knowing how (if) this analysis helped you think through and/or iterate further in any way. -->