// initial_stories.js
// Diese Daten werden nur verwendet, wenn im LocalStorage noch gar keine Rätsel sind.
const initialStoriesData = [
    {
        id: "initial_1", 
        title: "Der Mann im Fahrstuhl",
        difficulty: "Mittel",
        riddle: "Ein Mann wohnt im 10. Stock. Er fährt jeden Morgen mit dem Fahrstuhl bis ganz nach unten. Abends fährt er mit dem Fahrstuhl bis zum 7. Stock und geht den Rest zu Fuß. Warum? (Außer wenn es regnet, dann fährt er ganz hoch.)",
        solution: "Der Mann ist kleinwüchsig. Er erreicht nur den Knopf für den 7. Stock. Wenn es regnet, hat er seinen Regenschirm dabei und kann damit den Knopf für den 10. Stock drücken.",
    },
    {
        id: "initial_2",
        title: "Tödlicher Tauchgang",
        difficulty: "Schwer",
        riddle: "Ein Mann liegt tot in einem Wald. Neben ihm ein ungeöffnetes Paket.",
        solution: "Der Mann ist mit einem Fallschirm abgesprungen, der sich nicht geöffnet hat. Das Paket ist der Fallschirm.",
    },
    {
        id: "initial_3",
        title: "Die nackte Frau auf der Wiese",
        difficulty: "Leicht",
        riddle: "Eine nackte Frau liegt tot auf einer Wiese. Neben ihr ein Streichholz.",
        solution: "Sie war mit mehreren Personen in einem Heißluftballon. Der Ballon drohte abzustürzen. Sie zogen Streichhölzer, wer abspringen muss, um die anderen zu retten. Sie zog das kürzeste.",
    },
    {
        id: "initial_4",
        title: "Musik stoppte",
        difficulty: "Mittel",
        riddle: "Die Musik stoppte und sie starb. Erkläre.",
        solution: "Sie war eine Seiltänzerin im Zirkus, die mit verbundenen Augen tanzte. Die Musik gab ihr den Takt und die Orientierung vor. Als die Musik (vielleicht durch einen Stromausfall) plötzlich stoppte, verlor sie die Orientierung und stürzte ab.",
    },
    {
        id: "initial_5",
        title: "Der Mann im Auto",
        difficulty: "Leicht",
        riddle: "Ein Mann schiebt sein Auto bis zu einem Hotel und verliert daraufhin sein ganzes Vermögen. Was ist passiert?",
        solution: "Er spielt Monopoly und seine Spielfigur ist das Auto. Er landet auf einem Feld mit einem Hotel, das einem anderen Spieler gehört, und muss eine hohe Miete zahlen.",
    }
];