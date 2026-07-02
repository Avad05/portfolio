let phrases = ["that scales.", "with precision."];
let phraseIndex = 0;
let charIndex = phrases[0].length;
let isDeleting = false;

function type() {
  const currentPhrase = phrases[phraseIndex];
  
  if (isDeleting) {
    let text = currentPhrase.substring(0, charIndex - 1);
    charIndex--;
    console.log(`DELETING: "${text}" (charIndex: ${charIndex})`);
  } else {
    let text = currentPhrase.substring(0, charIndex + 1);
    charIndex++;
    console.log(`TYPING: "${text}" (charIndex: ${charIndex})`);
  }
  
  if (!isDeleting && charIndex === currentPhrase.length) {
    isDeleting = true;
    console.log("-> SWITCH TO DELETING");
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    console.log("-> SWITCH TO TYPING NEXT PHRASE");
  }
}

isDeleting = true;
for(let i=0; i<30; i++) type();
