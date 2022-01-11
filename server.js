const http = require("http")
const url = require("url")
const fs = require("fs")
const querystring = require("query-string");


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

                    /* Argument GET: arguments qui se situent après un "?" dans l'url sous forme de "clé=valeur" */

                    contentRes = `<h1>Page d'accueil</h1>
                    <a href='/categs'>Vers les catégories principales</a>
                    <br>
                    
                    <a href="/demo?name=Lison&lastname=Ferné">
                    Demo GET -> /demo?name=Lison&lastname=Ferné
                    </a>`;


                    res.writeHead(statusCode, head)
                    res.write(contentRes)
                    res.end()
                } else if (urlParse.pathname == "/contact") {

                    /* Lecture des données POST de la requête */
                    let body = "";
                    req.on("data", (form) => {
                        body += form.toString();
                    });

                    statusCode = 200
                    contentRes = `<h1>Page de contact en mode GET</h1>
                    <form method="POST" action="/contact">
                        <label for="name">Prénom</label><br>
                        <input type="text" name="name" id="name"><br>
                        <label for="lastname">Nom</label><br>
                        <input type="text" name="lastname" id="lastname"><br>
                        <button type="submit">Envoyer</button>
                    </form>`;

                    res.writeHead(statusCode, head)
                    res.write(contentRes)
                    res.end()

                } else if (urlParse.pathname.includes("/categs")) {

                    let error404 = false;
                    /* Categs : localhost:3000/categs */

                    /* Si on est sur la page d'accueil de "categs" */
                    if (urlParse.pathname === "/categs") {

                        statusCode = 200


                        contentRes = `<h1>Vous êtes sur les catégories principales</h1>
                    <ul>`
                        datas.categs.forEach(itemCateg => {
                            contentRes += `<li><a href="/categs/${itemCateg.id}/subcategs">${itemCateg.name}</a></li>`
                        });
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

                        if (categ !== undefined) {
                            /* Récupération de la subcateg (optionnelle !) avec une ternaire */

                            /* 1) on vérifie que la valeur existe */
                            const subCategId = urlSplit[4] != undefined ? parseInt(urlSplit[4]) : null;


                            /* Si urlSplit est différent de "undefined" on fait un parseInt(urlSplit[4]), sinon on renvoie "null" */
                            if (subCategId === null) {

                                contentRes = `<h1>Catégorie : ${categ.name}</h1><br>
                                <h2>Veuillez selectionner une sous-catégorie</h2>
                                <ul>`;
                                categ.subcategs.forEach((subCateg) => {
                                    console.log(subCateg);
                                    contentRes += `<li>
                                    <a href="categs/${categ.id}/subcategs/${subCateg.id}">
                                    ${subCateg.name}
                                    </a>
                                    </li>`
                                })
                                contentRes += `</ul>`;

                                res.writeHead(404, head)
                                res.write("Catégorie" + contentRes)
                                res.end()

                            } else {
                                error404 = true;

                                res.writeHead(404, head)
                                res.write("Categ ID" + urlParse.pathname)
                                res.end()

                            }

                        }

                    } /* En cas d'erreur */
                    else {
                        error404 = ":( Catégorie non disponible";
                        const subCateg = categ.subcategs.find(sc => sc.id === subCategId);
                        if (subCateg != undefined) {

                            contentRes = `<h1>Catégorie principale : ${categ.name}</h1>
                            <h2>Catégorie secondaire : ${subCateg.name}</h2>
                            <br>
                            <h3>Liste des produits</h3>
                            <ul>`;
                            subCateg.products.forEach(product => {
                                contentRes += `<li>
                                ${product.name} ${product.price} €;
                                                </li>`
                            })
                            contentRes += `</ul>`;

                            res.writeHead(statusCode, head)
                            res.write(contentRes)
                            res.end()
                        } else {
                            error404 = "Sous-catégorie inconnue";
                        }
                    }


                    /*
             // Sous-categs : localhost:3000/categs/42/subcategs/

                Detail Sub 2 : localhost:3000/categs/42/subcategs/2

                products : localhost:3000/categs/42/subcategs/2/products

                product 13 : localhost:3000/categs/42/subcategs/2/products?prod=13 */
                } else if (urlParse.pathname == "/demo") {

                    /* Les donnée envoyées en mode GET sont accessibles sur la propriété "search" mais en brut: /demo?name=Lison&lastname=Ferné */
                    console.log(urlParse.search);

                    /* Les données seront traitées en objet js et stockées dans la propriété "query" */
                    const dataGet = urlParse.query;
                    console.log(dataGet);
                    contentRes = `
                    <h1>Reception des données "GET"</h1>
                    <h2>Les données reçues: </h2>
                    <p>${dataGet.name} ${dataGet.lastname}</p>`;
                    statusCode = 200;

                    res.writeHead(statusCode, head);
                    res.write(contentRes);
                    res.end();

                } else {
                    res.writeHead(404, head);
                    res.write("<h1>Vous êtes perdus ? :O</h1>")
                }

            } else if (req.method == "POST") {
                if (urlParse.pathname == "/contact") {

                    /* Via l'event "data" on lit les données de la requête (c'est un evènement pré-enregistré dans js). L'event est présent uniquement si il y a des données à lire.  */
                    /* Les données seront stockées dans la variable "body" */
                    let body = ""

                    req.on('data', (form) => {
                        console.log(form);
                        body += form.toString()
                    });
                    /* Fin de la lecture des données: ce qui suit se déclenche lorsque les données ont été totalement lues (différent de res.end() )*/


                    req.on('end', () => {
                        let result;
                        console.log(body);

                        /* Test pour savoir si les données sont de type :
                        - JSON ou 
                        - x-ww-form-urlencoded */

                        /* Test sur le JSON (code de Loïc) */

                        if (body.startsWith("{") && body.endsWith("}")) {
                            result = JSON.parse(body);
                        } else {
                            /* La fonction "parse" est une des fonctions de "querystring" qui effectue une transformation en objet JS */
                            result = querystring.parse(body);
                            /* On va récupérer un objet js avec les champs du formulaire */
                        }

                        console.log(result);

                        /* Utilisation des données dans une nouvelle page qui va être envoyée */
                        statusCode = 200;
                        contentRes = `
                        <h1>Page de contact - Réponse</h1>
                        <h2>Bienvenue ${result.name} ${result.lastname}</h2>
                        <a href="/">Retourner à la page Home</a>
                        `;

                        res.writeHead(statusCode, head);
                        res.write(contentRes);
                        res.end();
                    });

                    /* Redirection de Loïc */

                    //je traite le formulaire ici
                    //et puis je redirige mon client vers autre part.
                    /* statusCode = 303
                    head = { "Location": "/" }

                    res.writeHead(statusCode, head)
                    res.write(contentRes)
                    res.end()
 */

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
    });

})

server.listen(process.env.PORT || 3000)