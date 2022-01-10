const http = require("http")
const url = require("url")
const fs = require("fs")


const server = http.createServer((req, res) => {

    let urlParse = url.parse(req.url, true)

    let contentRes = ""
    let statusCode = 500
    let head = { "Content-Type": "text/html; charset=utf-8" }

    /* On créer une variable de lecture du fichier qui englobe toutes les boucles */

    /* La lecture du fichier */
    fs.readFile("./content/datas.json", (error, datas) => {
        /* On prévoit le cas où le fichier à récupérer n'existe pas */
        if (error) {
            console.log(error);
            contentRes = "<h1>Le site a planté :( </h1>" +
                "<h2>Le fichier 'datas' est manquant</h2>"

            /* On cloture la requête */
            res.writeHead(500, head);
            res.write(contentRes);
            res.end();

            return; /* Met fin au traitement */


        } else {
            statusCode = 200;
            contentRes = `<h1>"Vous êtes dans les categs principales"</h1>`;

            console.log(error)
                /* Conversion des données en JSON */
            datas = JSON.parse(datas.toString())

            /* Traitement de la requête */

            console.log(urlParse)
            if (req.method == "GET") {
                if (urlParse.pathname == "/" || urlParse.pathname == "/accueil") {
                    statusCode = 200
                    contentRes = `<h1>Page d'accueil</h1>
            <a href='/categs'>Vers les catégories principales</a>`

                    res.writeHead(statusCode, head)
                    res.write(contentRes)
                    res.end()
                } else if (urlParse.pathname == "/contact") {
                    statusCode = 200
                    contentRes = `<h1>Page de contact en mode GET</h1>
                <input type="text" name="name"><br>
                <input type="text" name="lastname">
                <button type="submit">Envoyer</button>`

                    res.writeHead(statusCode, head)
                    res.write(contentRes)
                    res.end()

                } else if (urlParse.pathname.includes("/categs")) {

                    /* Categs : localhost:3000/categs */

                    /* Si on est sur la page d'accueil de "categs" */
                    if (urlParse.pathname === "/categs") {

                        statusCode = 200

                        contentRes = `<h1>Vous êtes sur les catégories principales</h1>
                    <ul>`
                        datas.categs.forEach(itemCateg => {
                            contentRes += `<li><a href="/categs/subcategs?categID=${itemCateg.id}">${itemCateg.name}</a></li>`
                        })
                        contentRes += `</ul>`

                        res.writeHead(statusCode, head)
                        res.write(contentRes)
                        res.end()

                    }

                    /* On va vérifier que l'on récupère le numéro de la catégorie */
                    /* REGEX */

                    /* Exemple de regex */
                    /*  const regexTest = /exemple/; */
                    else if (/^\/categs\/[1-9][0-9]*\/subcategs(\/[0-9]+)?/.test(urlParse.pathname)) {

                        /* Le contenu de l'url splitée (split: transforme une chaine de caractère en un tableau de données, séparées par un symbole (ici "/")*/
                        const urlSplit = urlParse.pathname.split("/");
                        console.log("urlSplit");

                        /* Exemple de valeur : ["", "categs", "42", "subcategs"] */

                        /* Récupération de la categId (avec parseInt) */
                        const categId = parseInt(urlSplit[2]);

                        /* Utilisation de la méthode "find" des arrays de JavaScript pour obtenir l'objet categ sur base de la valeur de son Id */

                        /* .find: Dans chaque élément "c" de la collection "datas.categs" , cherche l'id */
                        /* Prédicat: fonction callback exécutée par le find. Si le résultat est vrai, il arrête de travaailler, sinon il continu */
                        const categ = datas.categs.find(c => c.id === categId)

                        /* Récupération de la subcateg (optionnelle !) avec une ternaire */

                        /* 1) on vérifie que la valeur existe */
                        const subCategId = urlSplit[4] != undefined ? parseInt(urlSplit[4]) : null;
                        /* Si urlSplit est différent de "undefined" on fait un parseInt(urlSplit[4]), sinon on renvoie "null" */

                        res.writeHead(statusCode, head)
                        res.write("Url =>" + urlParse.pathname)
                        res.write("CategId =>" + categId)
                        res.end()
                    } else {
                        res.writeHead(404, head)
                        res.write("Not found")
                        res.end()
                    }


                    /*
             // Sous-categs : localhost:3000/categs/42/subcategs/

                Detail Sub 2 : localhost:3000/categs/42/subcategs/2

                products : localhost:3000/categs/42/subcategs/2/products

                product 13 : localhost:3000/categs/42/subcategs/2/products?prod=13 */


                } else if (req.method == "POST") {
                    if (urlParse.pathname == "/contact") {
                        let body = ""

                        req.on('data', (form) => {
                            body += form.toString()
                        })

                        req.on('end', () => {

                            //ici je suis dans la possibilité de recevoir de mon body (formulaire)
                            // "name=loic&lastname=baudoux"    ====> STRING que je peux parser avec le décodeur
                            // "{ 'name' : 'loic', 'lastname' : 'baudoux'}"     =====> STRING que je peux parser avec JSON.parse()
                            if (body.startsWith("{") && body.endsWith("}"))
                                body = JSON.parse(body)
                            else {

                                /*
                                Convertit "name=loic&lastname=baudoux" en JSON { 'name' : 'loic', 'lastname' : 'baudoux' } utilisable
                                */
                                body = JSON.parse('{"' + decodeURI(body).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
                            }

                            console.log(body)
                        })


                        //je traite le formulaire ici
                        //et puis je redirige mon client vers autre part.
                        statusCode = 303
                        head = { "Location": "/" }

                        res.writeHead(statusCode, head)
                        res.write(contentRes)
                        res.end()


                        // statusCode 302 -> redirection standard
                        // 307 -> passer de get à post puis redirger vers le meme lien en post 
                        // 303 -> passer de get à post puis redirger vers un autre lien en get 
                    }
                } else {
                    statusCode = 404
                    contentRes = `<h1>Je ne connais pas cette méthode HTTP : ${req.method}</h1>`

                    res.writeHead(statusCode, head)
                    res.write(contentRes)
                    res.end()
                }
            }
        }
    });

})

server.listen(process.env.PORT || 3000)