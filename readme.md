# Catdoc

**Catdoc** is a website engine (I haven't found a better term yet) written in client-side JavaScript that employs simple AJAX. It allows you to put categories on static web pages and use shortcuts when writing them. Catdoc is not considered to be a fully fledged framework or Content Management System.

## But why?

I originally wrote Catdoc to facilitate writing stuff for my website. This primarily meant to not use a MySQL-database, which was well protected but hard to access, which in turn took away the fun to do stuff on my own website. In that regard, Catdoc did succeed, and it also was way faster than the indirected-SQL-request-system (It was horrible).

In the current state however, there is little reason to use Catdoc. In order to host static web content without writing *all* the HTML, you are probably better served with something like [stagit](https://codemadness.org/git/stagit/file/README.html) or [cgit](https://git.zx2c4.com/cgit/about/) in combination with a Markdown compiler like [smu](https://github.com/karlb/smu/), without the need to learn a new markup language and requiring the user to activate JavaScript. Catdoc is merely simpler in that regard that no one needs to compile anything to generate the website.

I plan to transform Catdoc into something more useful in the future.

## What does the name "Catdoc" mean?

It stands for **Cat**egory **doc**ument. The original gimmick of Catdoc was a text file where documents and categories would be assigned to categories, in a way that is not unsimilar to relational databases. Also, I think that the name has a curious sound to it, perhaps because the syllables sound very similar to "cat" and "dog".

## Deployment

1. Put the following files in the root folder of your website:
	- [.cats](.cats)
	- [catdoc.js](catdoc.js)
	- [index.html](index.html)
2. Put your other files on your website. For every page, make sure to have at least one entry in the `.cats` file like `YourCategory	YourFileName`, where the space between the category and file name is a tab.
3. When writing hyperlinks which do not lead to external websites, make sure to include the attribute `onclick="a(this);"` in your `<a>`-tag.

