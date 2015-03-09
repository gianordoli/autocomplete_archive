# Citations

To include citations from a .bib file, use **[@title]**. For example, **[@fry_visualizing_2008]** refers to:

```
@book{fry_visualizing_2008,
	address = {Sebastopol, {CA}},
	edition = {1 edition},
	title = {Visualizing Data: Exploring and Explaining Data with the Processing Environment},
	isbn = {9780596514556},
	shorttitle = {Visualizing Data},
	language = {English},
	publisher = {O'Reilly Media},
	author = {Fry, Ben},
	month = jan,
	year = {2008}
}
```

# Converting to pdf

In terminal:

```
pandoc --filter pandoc-citeproc --bibliography bibliography.bib input_file.md -o output_file.pdf
```

If you want to use a custom latex template, add:

```
pandoc --filter pandoc-citeproc --template mytemplate.latex --bibliography bibliography.bib input_file.md -o paper.pdf
```