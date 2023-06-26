let schalter = document.querySelector(".schalterSeite1");
let schalter2 = document.querySelector(".schalterSeite2");
let line = document.querySelector(".line");
let pie = document.querySelector(".pie");
let kacheln = document.querySelectorAll(".kacheln");
let seite1 = document.querySelectorAll(".seite1");
let seite2 = document.querySelectorAll(".seite2");

schalter.addEventListener("click", () =>{
    for(let i = 0; i < seite1.length; i++) {
        seite1[i].style.display = "block";
    }

    for(let i = 0; i < seite2.length; i++) {
        seite2[i].style.display = "none";
    }
    
})

schalter2.addEventListener("click", () =>{
    for(let i = 0; i < seite1.length; i++) {
        seite1[i].style.display = "none";
    }
    for(let i = 0; i < seite2.length; i++) {
        seite2[i].style.display = "block";
    }
})