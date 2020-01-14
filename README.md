# stl-parser

## how to run code

Pull down the repo (or just the index.html and index.js files) and open the index.html file in a modern browser. Paste the STL text into the textarea and click the Parse STL button.

## design decisions

So my approach is pretty straightforward - I read in the entire text as an array, one line per element, strip out the 'unneccessary' parts, and create an array marking the beginning and end of each triangle. Then I create a Triangle object for each triangle in the text, using `facet normal` and `end facet` as markers for each triangle, pulling the vertexes out from that. I feed in this array of Triangles to an Output object, which calculates the total surface area, number of Triangles, and the minimum bounding box.

I went with an Object Oriented approach and I sort of regret it. Initially, I thought that there might be more than just Triangle shapes, hence the abstract Shape class. However, upon reading the Wikipedia for STL files more closely, it seems like the industry standard is to only use triangles, so this level of abstraction doesn't seem particularly useful. As there's only one Shape, a flyweight pattern I guess would work but would probably be a bit of overkill, as the generator function would make and store one Triangle and that'd be it.

I went with an axis aligned minimum bounding box as that was more straightforward than a minimum bounding box that isn't axis aligned. I'm sure that there are some handy algorithms for calculating a MBB that isn't axis aligned, but since the requirements didn't state which type of MBB was needed, I went for the easier of the two. Hopefully my implementation is correct and I'm actually finding the AAMBB.

## performance improvements

### use a language other than JS

JS is the language I'm most comfortable in but I don't think it's well suited for this kind of work. Python, Java, or something lower level would probably be better.

### overall design

Rather than creating an array of Triangle shapes and then calculating the output values after reading in the entire text, I'd have one Triangle shape and iteratively build the output. Read one Triangle in, add one to Number of Triangles, update the surface area, and update the MBB, then update that Triangle object with the next triangle in the file. Fewer objects created, no passing arrays around, and a much better solution.

### surface area

Cross Product is one of a few different ways of calculating the surface area and it seems a little expensive. I'm not sure which methods for calculating surface area would be better, but this is definitely an area where there's room for improvement. I doubt creating a cache and looking for patterns in the vectors creating the triangles would be helpful but it's something to consider. So if we see a Vector A is (1,1,1) and Vector B is (2,2,2), if we later see a triangle with those same vectors, we can save ourselves that relatively expensive calculation.
