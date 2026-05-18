/**
 * Seed WhatsApp chat history from exported chat files
 * Data source: 5 WhatsApp chat exports between Brishna (teacher) and students
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// Student mapping
const students = {
  esra: { id: "cmpbazdd30068w413twfp7ngi", phone: "+905551000001", name: "Esra" },
  ayse: { id: "cmpbazday002ow413rxvu7ggf", phone: "+905551000002", name: "Ayse" },
  fatmagul: { id: "cmpbazd9x000zw413b0gaezkp", phone: "+905551000003", name: "Fatima Gul" },
  bilal: { id: "cmpbazde3007rw413z30i9n73", phone: "+905551000004", name: "Bilal" },
  mustafa: { id: "cmpbaydam00007wpgjl83k0d4", phone: "+905551000005", name: "Mustafa" },
};

// Parse WhatsApp chat format: "DD/MM/YYYY, HH:MM - Sender: Message"
function parseChat(raw: string, studentLabel: string): Array<{
  date: Date;
  sender: "student" | "teacher";
  content: string;
  messageType: string;
}> {
  const messages: Array<{ date: Date; sender: "student" | "teacher"; content: string; messageType: string }> = [];
  const lines = raw.split("\n");

  const lineRegex = /^(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}) - (.+?): (.+)$/;

  for (const line of lines) {
    const match = line.match(lineRegex);
    if (!match) continue;

    const [, day, month, year, hour, minute, sender, content] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));

    // Skip system messages
    if (content.includes("end-to-end encrypted")) continue;
    if (content.includes("Messages and calls are")) continue;

    const isTeacher = sender === "B";
    const isStudent = sender.includes(studentLabel);
    if (!isTeacher && !isStudent) continue;

    // Determine message type
    let messageType = "TEXT";
    let msgContent = content;
    if (content.includes("(file attached)")) {
      if (content.includes(".jpg") || content.includes(".png")) messageType = "IMAGE";
      else if (content.includes(".pdf") || content.includes(".docx")) messageType = "DOCUMENT";
      else if (content.includes(".opus")) messageType = "AUDIO";
      else messageType = "DOCUMENT";
    }
    if (content === "<Media omitted>") {
      messageType = "MEDIA";
      msgContent = "(media omitted)";
    }
    if (content.includes("You deleted this message")) continue;

    messages.push({
      date,
      sender: isTeacher ? "teacher" : "student",
      content: msgContent,
      messageType,
    });
  }

  return messages;
}

// Raw chat data embedded directly
const esraChat = `07/04/2026, 16:45 - B: Hello Esra. How are you? I am Brishna Khan and i will be your new english teacher.
07/04/2026, 16:47 - B: We will have our lessons thrice a week. MONDAY WEDNESDAY and FIDAY from 8-9.30pm
07/04/2026, 18:18 - Esra Std: Helloo im okaaayy. Nice to meet uuu
07/04/2026, 18:18 - Esra Std: It is suitable for me
07/04/2026, 18:23 - B: Perfect. See you tomorrow then
08/04/2026, 15:22 - Esra Std: Hello how are you
08/04/2026, 15:22 - Esra Std: I'm feeling a little unwell today.
08/04/2026, 15:22 - Esra Std: Can we start the lesson from Friday?
08/04/2026, 15:32 - B: Yeah sure no problem. Get well soon
10/04/2026, 19:00 - Esra Std: Hello
10/04/2026, 19:00 - Esra Std: There's class today, right?
10/04/2026, 19:08 - B: Hey yes
10/04/2026, 19:58 - B: https://teams.microsoft.com/meet/347671804933733?p=8qtiLubrsXgD0POpKu
10/04/2026, 20:37 - B: IMG-20260410-WA0081.jpg (file attached)
10/04/2026, 20:55 - B: IMG-20260410-WA0082.jpg (file attached)
10/04/2026, 20:56 - B: IMG-20260410-WA0083.jpg (file attached)
10/04/2026, 21:19 - B: parts_of_speech_homework.pdf (file attached)
13/04/2026, 19:57 - B: https://teams.microsoft.com/meet/318369743989556?p=dfJWHOWTtyF4x3TDm7
13/04/2026, 20:46 - B: Noun.docx (file attached)
15/04/2026, 12:19 - B: Hey, how are you doing?
15/04/2026, 12:19 - B: I have some urgent work today, so i won't be able to take class today. We can have it on friday.
15/04/2026, 12:21 - Esra Std: Im okaayy uuu
15/04/2026, 12:22 - Esra Std: Okaayy no probleemm Take care of yourself
15/04/2026, 12:22 - B: I am fine, thank you.
15/04/2026, 12:22 - B: You too dear
17/04/2026, 18:07 - Esra Std: IMG-20260417-WA0263.jpg (file attached)
17/04/2026, 18:07 - Esra Std: First of all, I'm not Mustafa.
17/04/2026, 18:15 - B: Yeah sorry i forgot to edit the name
17/04/2026, 18:16 - Esra Std: I am joking
17/04/2026, 18:16 - B: Hahaha i knew it
17/04/2026, 18:17 - Esra Std: I'm sick today, can we cancel the class?
17/04/2026, 18:17 - B: Oh sure.
17/04/2026, 18:17 - B: What happened?
17/04/2026, 18:18 - Esra Std: I became influenza. I'm attracting all the germs
17/04/2026, 18:31 - B: Hahaha. Then careful dear.
17/04/2026, 18:32 - B: Get well soon. And if you need any advice to get treated you can ask me.
17/04/2026, 18:33 - Esra Std: What can I do? I don't want to take medication.
17/04/2026, 18:35 - B: Did you catch flu?
17/04/2026, 20:11 - Esra Std: Yes
17/04/2026, 22:07 - B: Best remedy is honey ginger tea
20/04/2026, 20:04 - Esra Std: Haaaayyy
20/04/2026, 20:04 - B: Heya. How are you?
20/04/2026, 20:05 - Esra Std: Im okaayy u
20/04/2026, 20:05 - B: I am good thank you.
20/04/2026, 20:05 - Esra Std: Is there a class today?
20/04/2026, 20:06 - B: Yeah at 8.30
20/04/2026, 20:06 - Esra Std: Okaayy
20/04/2026, 20:28 - B: https://teams.microsoft.com/meet/371106801814728?p=TrLrtXxBGZ5B119Woo
20/04/2026, 21:13 - B: Pronouns.docx (file attached)
20/04/2026, 21:49 - B: pronouns_homework.docx (file attached)
22/04/2026, 20:35 - Esra Std: Hey
22/04/2026, 20:38 - B: Hey. Just give me 10 min i will be home.
22/04/2026, 20:40 - Esra Std: okaayy
22/04/2026, 20:48 - B: https://teams.microsoft.com/meet/361494472197990?p=vX58abqut8dKswJQh8
22/04/2026, 21:34 - B: Verb.docx (file attached)
22/04/2026, 21:35 - B: VerbFormsEnglishLanguageLearnersAccessibleFebruary2020.pdf (file attached)
22/04/2026, 21:37 - B: https://www.ivyenglish.kr/book_image/Questions%20and%20Idoms%20book%201_1557768189764.pdf
24/04/2026, 14:05 - Esra Std: Hello
24/04/2026, 14:55 - Esra Std: Are u okay?
24/04/2026, 17:12 - B: Hey. Sorry. I was on my way
24/04/2026, 17:12 - B: Coming back from Sile
24/04/2026, 17:13 - B: I just reached.
24/04/2026, 17:17 - B: I didn't have signals to inform
25/04/2026, 10:38 - Esra Std: Helloo I was on the road yesterday.
25/04/2026, 12:33 - B: Hey how was the concert
25/04/2026, 22:02 - Esra Std: It wasss awesome, I wish you were here too
25/04/2026, 22:54 - B: thats great you enjoyed.
27/04/2026, 19:58 - Esra Std: Hello
27/04/2026, 20:07 - B: Hy
27/04/2026, 20:10 - Esra Std: Is there a class today?
27/04/2026, 20:10 - B: Yes. 8.45
27/04/2026, 20:48 - B: https://teams.microsoft.com/meet/389564858536809?p=NRf9QSmEdD2omVNzNo
27/04/2026, 21:42 - Esra Std: IMG-20260427-WA0046.jpg (file attached)
27/04/2026, 21:57 - B: https://eduteach.es/worksheets-grammar.pdf
29/04/2026, 20:04 - Esra Std: Hello
29/04/2026, 20:04 - B: Hey.
29/04/2026, 20:05 - Esra Std: What time is the class?
29/04/2026, 20:05 - B: 8.45
29/04/2026, 20:46 - B: https://teams.microsoft.com/meet/316554218602278?p=PF5etYe8KTgLH0jotZ
30/04/2026, 11:23 - B: homework.docx (file attached)
01/05/2026, 00:04 - B: Hey. Yarin dersimiz yok.
04/05/2026, 12:37 - B: hello. how are you?
04/05/2026, 12:38 - B: this week can we have our lesson 11.30 pm?
04/05/2026, 12:38 - Esra Std: Hellooo
04/05/2026, 12:40 - Esra Std: 11:30 PM is very late. I'm usually in bed at that time because I have work the next day.
04/05/2026, 12:40 - B: 10?
04/05/2026, 18:19 - B: Can you confirm this?
04/05/2026, 18:32 - Esra Std: I'll be working overtime today.
04/05/2026, 18:32 - Esra Std: It would be better to cancel the class.
04/05/2026, 18:51 - B: Oh okay then. What about Wednesday?
04/05/2026, 21:37 - Esra Std: It will be on Wednesday.
04/05/2026, 21:47 - B: Ok
05/05/2026, 14:51 - B: Hey. Are you free today?
05/05/2026, 15:24 - Esra Std: I'm going to the gym tonight.
05/05/2026, 15:26 - B: Oh okay no prob
06/05/2026, 20:20 - Esra Std: Hello?
06/05/2026, 20:23 - B: Heya.
06/05/2026, 20:23 - Esra Std: Is there a class today?
06/05/2026, 20:24 - B: Normally its Tomorrow but i am free we can do
06/05/2026, 20:25 - Esra Std: Normally it's tonight, right?
06/05/2026, 20:26 - B: Oh sorry sorry i mixed up. yeah its now.
06/05/2026, 20:26 - B: I will send you a link and a quiz.
06/05/2026, 20:27 - Esra Std: Okaaayy im waitingg
06/05/2026, 20:31 - B: https://teams.microsoft.com/meet/318949001621934?p=2SR27HjX8BIlYnQUsu
06/05/2026, 20:34 - B: Did you join?
06/05/2026, 20:38 - B: DOC-20260506-WA0012. (file attached)
06/05/2026, 20:50 - Esra Std: Sinav.pdf (file attached)
06/05/2026, 21:10 - B: https://www.youtube.com/watch?v=e9GgBK4TVNU
08/05/2026, 20:17 - Esra Std: Heyy
08/05/2026, 20:18 - Esra Std: I haven't even been able to quit my job yet.
08/05/2026, 20:18 - Esra Std: What if we held our classes on Mondays, Wednesdays, and Thursdays?
08/05/2026, 20:19 - B: Hey. Its okay. No problem.
11/05/2026, 20:31 - B: https://teams.microsoft.com/meet/334964239343528?p=p23njNDddaDXeX5HrX
11/05/2026, 20:32 - Esra Std: 20.45
11/05/2026, 20:32 - B: ok
11/05/2026, 22:00 - B: Perfect tenses.docx (file attached)
11/05/2026, 22:00 - B: Perfect_Tenses_Homework.docx (file attached)
13/05/2026, 13:30 - Esra Std: Hello
13/05/2026, 13:30 - Esra Std: My colleague's daughter passed away, so I'm going to the funeral this evening. Can we cancel the class?
13/05/2026, 13:31 - B: Yes sure no problem
13/05/2026, 13:50 - B: My condolences
14/05/2026, 15:46 - Esra Std: Hello
14/05/2026, 15:46 - Esra Std: Will there be a class tonight?
14/05/2026, 15:47 - B: Hey. No we dont have a leasson today
14/05/2026, 15:48 - Esra Std: Can we implement this after this week?
14/05/2026, 15:49 - B: Yeah sure no problem.
15/05/2026, 20:31 - B: Hey. Are you available for the class?
18/05/2026, 18:11 - Esra Std: Heyy brishnaa
18/05/2026, 18:11 - B: Heya
18/05/2026, 18:11 - Esra Std: I couldn't write to you while I was on the road.
18/05/2026, 18:12 - B: Its okay
18/05/2026, 18:12 - B: No prob
18/05/2026, 18:12 - B: Are you available today?
18/05/2026, 18:13 - Esra Std: Im so sooorry
18/05/2026, 18:13 - Esra Std: Yesss
18/05/2026, 18:14 - B: Perfect. At 9
18/05/2026, 18:18 - Esra Std: Okaaayy`;

const ayseChat = `12/04/2026, 13:30 - B: Hello Ayse, I hope you are doing well. I am Brishna. I will be your new english teacher.
12/04/2026, 13:33 - Ayse Std: Hellooo I am good
12/04/2026, 13:34 - Ayse Std: I hope you are doing well too
12/04/2026, 13:34 - Ayse Std: Nice to meet you
12/04/2026, 13:36 - B: Nice to meet you too. What time are you available for class?
12/04/2026, 13:38 - Ayse Std: My free days are monday friday saturday and sunday
12/04/2026, 13:42 - B: How about monday and Friday 12.30 to 2 pm
12/04/2026, 13:43 - Ayse Std: Yess
12/04/2026, 13:44 - Ayse Std: Thats okay for me
12/04/2026, 13:44 - B: Perfect. Then i will see you on Monday
13/04/2026, 12:30 - B: https://teams.microsoft.com/meet/35431430021060?p=XP55DuvUW4OAih1qzt
13/04/2026, 12:30 - B: Good afternoon.
13/04/2026, 12:31 - B: here is your class link
13/04/2026, 13:49 - B: Parts of Speech.docx (file attached)
13/04/2026, 13:57 - B: parts_of_speech_homework.pdf (file attached)
17/04/2026, 03:42 - B: Hey how are you? Tomorrow there isn't any class. I am out of the city.
17/04/2026, 11:59 - Ayse Std: Okay teacher have fun
17/04/2026, 12:00 - B: Thanks
20/04/2026, 12:27 - B: good morning
20/04/2026, 12:27 - B: https://teams.microsoft.com/meet/373813713480908?p=jCpdCeGsJpDNfcguWf
23/04/2026, 22:45 - B: Hey. How are you?
23/04/2026, 22:46 - B: Can we have our class in the evening?
23/04/2026, 23:01 - Ayse Std: Hiii l am good thanks
23/04/2026, 23:01 - Ayse Std: Yess sure
23/04/2026, 23:02 - Ayse Std: What time?
23/04/2026, 23:10 - B: 10pm?
23/04/2026, 23:10 - Ayse Std: Okay
24/04/2026, 10:00 - B: Good morning.
24/04/2026, 15:49 - Ayse Std: Good morning
24/04/2026, 15:49 - Ayse Std: Teacher
24/04/2026, 15:50 - Ayse Std: Sorry
24/04/2026, 15:50 - Ayse Std: I didnt see it
24/04/2026, 17:13 - B: Oh. Its okay no problem
24/04/2026, 22:12 - Ayse Std: Teacher
24/04/2026, 22:12 - Ayse Std: Is there a class?
24/04/2026, 22:13 - B: Its late. Lets have tomorrow at 6pm
24/04/2026, 22:17 - Ayse Std: Can we do it at noon
24/04/2026, 22:18 - B: I have classes from 9.30 to 5 tomorrow
24/04/2026, 22:21 - Ayse Std: How about 10 in the evening
24/04/2026, 22:23 - B: Okay we can do that
24/04/2026, 22:25 - Ayse Std: Okayy deal
25/04/2026, 21:58 - B: https://teams.microsoft.com/meet/3753511525733?p=W3QSu6CCAKMbAbLBiv
25/04/2026, 23:26 - B: Present_Simple_Homework.docx (file attached)
26/04/2026, 01:20 - Ayse Std: ayse_homework.docx (file attached)
27/04/2026, 12:26 - B: Hey. Can we have our class tonight at 10.30?
27/04/2026, 12:26 - Ayse Std: Teacher Noo
27/04/2026, 12:26 - Ayse Std: I am not available
27/04/2026, 12:27 - B: When will you be available on the afternoon?
27/04/2026, 12:27 - Ayse Std: Noo sorry
27/04/2026, 12:27 - B: Tomorrow?
27/04/2026, 12:29 - B: I caught cold and flu. I cant speak my throat is aching
27/04/2026, 12:30 - Ayse Std: Oooo
27/04/2026, 12:31 - Ayse Std: I hope you get well soon
27/04/2026, 12:31 - Ayse Std: I am available tomorrow but evening
27/04/2026, 12:31 - B: I took medicine. I will rest a bit. Thats why i asked anytime today.
27/04/2026, 12:31 - B: When
27/04/2026, 12:31 - Ayse Std: Because l have school
27/04/2026, 12:32 - Ayse Std: After six
27/04/2026, 12:35 - B: Tomorrow 10.30?
27/04/2026, 12:38 - Ayse Std: Yes sure
27/04/2026, 12:38 - B: Okay perfect. Thank you. I will see you tomorrow at 10.30
27/04/2026, 12:38 - Ayse Std: See you
28/04/2026, 22:31 - B: https://teams.microsoft.com/meet/328543086684542?p=8FIYhDvKQuGdgydnwI
28/04/2026, 22:33 - Ayse Std: 5 minutes
28/04/2026, 22:33 - Ayse Std: Please
28/04/2026, 22:33 - B: ok
01/05/2026, 00:03 - B: Iyi aksamlar. Yarin dersimiz yok
01/05/2026, 00:05 - Ayse Std: Turkish
01/05/2026, 00:06 - B: Hahahahah yessss.
01/05/2026, 00:06 - Ayse Std: Why
01/05/2026, 00:06 - B: Tomorrow is a public holiday. But if you want we can have it
01/05/2026, 00:08 - Ayse Std: I didnt know
01/05/2026, 00:09 - B: Its 1st may. Its a labor day.
01/05/2026, 00:09 - Ayse Std: Ooooowww true
01/05/2026, 00:10 - B: Take a rest. Revise your lessons. May be there will be a surprise quiz on monday
01/05/2026, 00:11 - Ayse Std: I am not ready
01/05/2026, 00:11 - Ayse Std: But I will study and l will be ready
01/05/2026, 00:12 - B: Perfect. I will see you on monday
01/05/2026, 00:12 - Ayse Std: See youu
04/05/2026, 12:30 - B: good afternoon
04/05/2026, 12:30 - B: https://teams.microsoft.com/meet/368954477371148?p=FjIe5lxQmEJShjAxwJ
04/05/2026, 12:36 - B: are you there?
04/05/2026, 14:13 - Ayse Std: Teacher l am sorry
04/05/2026, 14:13 - Ayse Std: I didn't sleep all night
04/05/2026, 14:14 - Ayse Std: I have a toothache
04/05/2026, 14:15 - Ayse Std: I went to sleep at 9 in the morning
04/05/2026, 17:36 - B: Oh okay. No prob
05/05/2026, 15:16 - B: Hey. Are you free this evening
05/05/2026, 15:17 - Ayse Std: What time is it
05/05/2026, 15:20 - B: Anytime between 6-9
05/05/2026, 16:13 - Ayse Std: I leave school at six
05/05/2026, 16:13 - Ayse Std: I will be at home at 7.30
05/05/2026, 16:14 - Ayse Std: 8.30 it would be better
05/05/2026, 16:23 - B: I guess 8.30 is fine
05/05/2026, 20:32 - B: https://teams.microsoft.com/meet/396615341314677?p=sqXxTa1pMFE2MCktUZ
05/05/2026, 21:55 - B: Continuous tenses.docx (file attached)
05/05/2026, 21:55 - B: homework.docx (file attached)
06/05/2026, 20:09 - B: Hey. Tomorrow at what time you are available?
06/05/2026, 20:37 - Ayse Std: I am available after 17.00
06/05/2026, 20:39 - B: How about tomorrow at 6?
06/05/2026, 20:41 - Ayse Std: It is okay
06/05/2026, 20:44 - B: Perfect.
07/05/2026, 17:50 - Ayse Std: WhatsApp Image 2026-05-07 at 17.46.48 (1).pdf (file attached)
07/05/2026, 18:02 - B: https://teams.microsoft.com/meet/357503824799467?p=9xwllFdaYnv19X53ri
07/05/2026, 18:11 - B: DOC-20260506-WA0012. (file attached)
07/05/2026, 18:23 - Ayse Std: IMG-20260507-WA0014.jpg (file attached)
07/05/2026, 18:23 - Ayse Std: IMG-20260507-WA0015.jpg (file attached)
07/05/2026, 18:32 - B: https://www.youtube.com/watch?v=PKB6x3qpC20
07/05/2026, 18:45 - B: https://www.youtube.com/watch?v=H3zJIP3BJ6Y
11/05/2026, 12:49 - Ayse Std: Teacher
11/05/2026, 12:49 - B: Yes
11/05/2026, 12:49 - Ayse Std: Will we study
11/05/2026, 12:50 - B: Yeah but as we discussed that only for this week the classes will be on Tuesday and Thursday
11/05/2026, 12:50 - B: In the evening
11/05/2026, 12:51 - Ayse Std: I forgot
11/05/2026, 12:51 - Ayse Std: Okayyy
11/05/2026, 12:51 - B: Then will see you tomorrow
11/05/2026, 12:51 - Ayse Std: Today I am going to the dentist
11/05/2026, 12:52 - Ayse Std: I am very upset
11/05/2026, 12:52 - B: For transplant?
11/05/2026, 12:53 - Ayse Std: Dentist pull my teeth
11/05/2026, 12:53 - B: Its so painful
11/05/2026, 12:53 - Ayse Std: Yessss
11/05/2026, 12:54 - B: But its just one time so you will be fine.
11/05/2026, 12:55 - Ayse Std: I hope so
11/05/2026, 12:56 - B: Get well soon dear
11/05/2026, 19:22 - B: Hey. Tomorrow are you free at 5.30?
11/05/2026, 21:23 - Ayse Std: I have school
11/05/2026, 21:24 - Ayse Std: I am free after seven
11/05/2026, 21:28 - B: At 10?
11/05/2026, 22:41 - Ayse Std: Okayyy
12/05/2026, 22:12 - B: https://teams.microsoft.com/meet/394853743284744?p=vOjZxm7s5nvHoUiazi
14/05/2026, 20:47 - B: Hello. We dont have class today. I am stuck somewhere.
14/05/2026, 20:49 - Ayse Std: Okay its okayy
15/05/2026, 20:36 - B: Hello. How are you?
15/05/2026, 20:36 - B: From Monday we will continue our lessons at the same time in the morning.
15/05/2026, 21:11 - Ayse Std: Hiii everything fine
15/05/2026, 21:12 - Ayse Std: And you
15/05/2026, 21:12 - Ayse Std: Okayy super
15/05/2026, 21:56 - B: I am good too. Thanks
18/05/2026, 11:43 - B: Hey. Today your class will be at 14.00
18/05/2026, 14:02 - B: https://teams.microsoft.com/meet/370787186735335?p=yrVWuZW60dX4li0kvQ
18/05/2026, 15:37 - B: ayse_homework_mcq.pdf (file attached)`;

const fatmagulChat = `07/04/2026, 16:39 - B: Hello Fatima gul. How are you? I am Brishna Khan and i will be your new english teacher.
07/04/2026, 16:40 - B: We will have our classes on Monday and Friday from 11-12.30 in the morning
07/04/2026, 16:50 - Fatmagul Std: Hello Brishna i'm so happy. Its okay :)
07/04/2026, 16:51 - B: I will see you on Friday then
07/04/2026, 16:53 - Fatmagul Std: Okey see you
10/04/2026, 11:01 - B: hey good morning
10/04/2026, 11:01 - B: https://teams.microsoft.com/meet/3704595572973?p=3DomKHLcIluHFJGwbV
10/04/2026, 11:01 - B: here is your link for the class
10/04/2026, 11:01 - Fatmagul Std: Good morningg
10/04/2026, 11:02 - Fatmagul Std: Katiliyorum hemen
10/04/2026, 11:02 - B: Ok. Waiting
10/04/2026, 12:16 - B: IMG-20260410-WA0013.jpg (file attached)
10/04/2026, 13:13 - B: parts_of_speech_homework.pdf (file attached)
10/04/2026, 13:14 - B: homework
10/04/2026, 13:38 - Fatmagul Std: Thank youu
10/04/2026, 13:40 - B: You're welcome dear
13/04/2026, 10:58 - B: https://teams.microsoft.com/meet/341816813375602?p=6174U5q6wVwg7oWqpC
13/04/2026, 10:58 - B: Good Morning. Class links has sent
13/04/2026, 12:08 - B: Noun.docx (file attached)
17/04/2026, 03:41 - B: Hey. How are you? Tomorrow there isn't any class. I am out of the city.
20/04/2026, 10:40 - Fatmagul Std: G morningg
20/04/2026, 10:41 - Fatmagul Std: Bugun ders yapacakmiyiz :)
20/04/2026, 10:46 - B: Good morning.
20/04/2026, 10:47 - B: If we start at 2.00 pm is it okay for you?
20/04/2026, 10:47 - Fatmagul Std: Okey
20/04/2026, 10:48 - B: Perfect. I will see you at 14.00
20/04/2026, 14:03 - B: https://teams.microsoft.com/meet/397802096903821?p=Zs4A24kbc8HjdlqDSK
22/04/2026, 10:51 - B: Merhaba Gunaydin.
22/04/2026, 10:52 - B: 3-4.30 ben musaitm. Yapabiliriz
22/04/2026, 10:53 - Fatmagul Std: Ucte de var is gorusme
22/04/2026, 10:54 - B: Sadece bugun veya her carsamba?
22/04/2026, 10:54 - Fatmagul Std: Sadece bugun
22/04/2026, 10:54 - B: Tamam. Ozaman bugun ders iptal edebiliriz. No problem
23/04/2026, 22:42 - B: Hey. How are you?
23/04/2026, 22:43 - B: Are you free tomorrow evening? I wont be able to take class in the morning
23/04/2026, 22:45 - B: After 8.30pm?
23/04/2026, 22:47 - Fatmagul Std: Okey 8.30 uygun bana
23/04/2026, 22:48 - B: Tamam. I will message you tomorrow.
24/04/2026, 10:00 - B: Gunaydin canim.
24/04/2026, 10:00 - Fatmagul Std: Gunaydinn
24/04/2026, 10:07 - B: No no i mean if you are free we can do at the same time 11am
24/04/2026, 10:11 - B: Olur. 8.45ta baslayacagiz.
24/04/2026, 20:47 - B: https://teams.microsoft.com/meet/316169732450259?p=5YjziyT9IceRF6ddLP
24/04/2026, 21:11 - B: VerbFormsEnglishLanguageLearnersAccessibleFebruary2020.pdf (file attached)
28/04/2026, 16:29 - B: Hello. How are you?
28/04/2026, 16:29 - B: Is it ok to have class today at 18.00?
28/04/2026, 16:33 - Fatmagul Std: Okeyyy yapalim
28/04/2026, 16:38 - B: Perfect. See you then
28/04/2026, 18:01 - B: https://teams.microsoft.com/meet/383346444771040?p=xAlpWq3TCQerdLCxTW
29/04/2026, 11:03 - B: good morning
29/04/2026, 11:03 - B: https://teams.microsoft.com/meet/368095382404397?p=mYJuZwcRAU5B0BgELu
29/04/2026, 11:19 - Fatmagul Std: Ayyy telefonu duymadim
29/04/2026, 11:20 - B: if you want we can take class now or else tomorrow
29/04/2026, 11:21 - Fatmagul Std: Yarin olsun mu
29/04/2026, 11:22 - B: olur. saat 11? perfect. see you tomorrow then
29/04/2026, 11:23 - Fatmagul Std: Cok cok tesekkur ederimm
30/04/2026, 11:06 - B: https://teams.microsoft.com/meet/339648809775344?p=ZwnXlLzlk0dUwiUuxA
30/04/2026, 11:11 - B: good morning
30/04/2026, 11:29 - Fatmagul Std: hemen geliyorum canim
30/04/2026, 12:25 - B: Continuous tenses.docx (file attached)
30/04/2026, 12:25 - B: homework.docx (file attached)
01/05/2026, 00:03 - B: Hey. Yarin ders yok
01/05/2026, 00:04 - Fatmagul Std: Tamam evet soylemistin biliyorumm
04/05/2026, 09:17 - B: Hey. Get well soon dear. Its okay we can do later.
05/05/2026, 14:49 - B: Hey. How are you? When are you free today
05/05/2026, 15:13 - Fatmagul Std: Bugunde pek iyi degil ama yarin ders yapabiliriz
05/05/2026, 15:15 - B: Okay no prob. Rest well
05/05/2026, 16:56 - B: Hey. This week and next week, i won't be able to take class in the morning, so can we switch to Tuesday and Thursday evening?
05/05/2026, 16:59 - Fatmagul Std: Gecebiliriz canim hic problem yok
05/05/2026, 17:00 - B: Thank you. You can decide the timings.
05/05/2026, 17:12 - Fatmagul Std: Okey aksam 8 olabilir bana
05/05/2026, 18:11 - B: Perfect.
06/05/2026, 20:15 - Fatmagul Std: Holaaa my dear
06/05/2026, 20:15 - B: Heyaaa. How are you doing
06/05/2026, 20:16 - Fatmagul Std: I am good what about you
06/05/2026, 20:19 - B: We agreed on Thursday
06/05/2026, 20:19 - Fatmagul Std: Evet yanlis anladim bugun carsamba. Soryy
06/05/2026, 20:20 - Fatmagul Std: Yarina cok iyi hazir olmus olacagim o halde
06/05/2026, 20:20 - B: Evet cunku ben yarin quiz yapacam
06/05/2026, 20:21 - B: I will see you tomorrow
07/05/2026, 20:01 - B: https://teams.microsoft.com/meet/399961116048994?p=ZJIyu5sBvoQAXfW2P0
08/05/2026, 20:35 - B: Hy can we start our lesson at 9 instead of 10
08/05/2026, 20:36 - Fatmagul Std: Oluuur
08/05/2026, 21:02 - B: https://teams.microsoft.com/meet/342830001858181?p=Nzx8xFl6oNpuic8igF
11/05/2026, 18:58 - Fatmagul Std: Hello, how are you
11/05/2026, 19:09 - B: Hey i am good. How about you
11/05/2026, 19:17 - B: Can we start at 7.30 today?
11/05/2026, 19:18 - Fatmagul Std: No 22.00 olsa bana cok daha iyi olur
11/05/2026, 19:20 - Fatmagul Std: Ozaman yarin saat 22 olsun aksam
11/05/2026, 19:20 - B: Olsun
12/05/2026, 22:12 - B: https://teams.microsoft.com/meet/394853743284744?p=vOjZxm7s5nvHoUiazi
12/05/2026, 22:13 - Fatmagul Std: Geldimm
13/05/2026, 21:22 - Fatmagul Std: Holaaa
13/05/2026, 21:24 - Fatmagul Std: Askim bu aksamki dersi iptal edebilir miyiz balikesirden donuyorum
13/05/2026, 21:24 - B: Tamam no problem
15/05/2026, 20:36 - B: Hello. How are you?
15/05/2026, 20:36 - B: From Monday we will continue our lessons at the same time in the morning.
15/05/2026, 22:04 - Fatmagul Std: Tamammm okeyyy
15/05/2026, 22:04 - Fatmagul Std: Bugun dersimiz yok degil miii
15/05/2026, 22:46 - B: Evet bugun yok
18/05/2026, 10:27 - Fatmagul Std: Brishnaa helloo
18/05/2026, 10:28 - Fatmagul Std: Aksam yapmaya devam edelimmi
18/05/2026, 11:10 - B: Hey. Kacta
18/05/2026, 11:10 - Fatmagul Std: Ayni saatte 10?
18/05/2026, 11:12 - B: 10da taner var. Musaitsen saat 15.30ta yapabiliriz
18/05/2026, 11:12 - Fatmagul Std: Olur okeyy
18/05/2026, 15:14 - Fatmagul Std: Askim trafikteyim sana yetisemeyecegim
18/05/2026, 15:27 - B: Tomorrow?
18/05/2026, 15:28 - Fatmagul Std: Tamam 16.00?
18/05/2026, 15:28 - B: Olur`;

const bilalChat = `12/04/2026, 13:35 - B: Hello Belal. How are you? I am Brishna and I will be your new english teacher.
12/04/2026, 20:48 - Bilal Stdd: hello nice to meet you
12/04/2026, 20:49 - Bilal Stdd: im very well and you
12/04/2026, 20:49 - Bilal Stdd: but my name bilal :D
12/04/2026, 20:49 - B: I am good too. Thank you.
12/04/2026, 20:49 - B: Hahahah sorry
12/04/2026, 20:50 - Bilal Stdd: np teacher :D
12/04/2026, 20:51 - B: Okay so which days are suitable for you?
13/04/2026, 08:46 - Bilal Stdd: Today and thursday okey if you available
13/04/2026, 09:06 - B: Time?
13/04/2026, 11:21 - Bilal Stdd: It could be 8-9pm you can choose
13/04/2026, 12:22 - B: How about tuesday and Thursday 9 to 10.30?
13/04/2026, 12:25 - Bilal Stdd: it is possible
13/04/2026, 12:25 - B: Perfect. We will start from tomorrow then.
13/04/2026, 12:26 - Bilal Stdd: We agreed
13/04/2026, 12:26 - B: See you tomorrow
14/04/2026, 20:04 - B: Good evenings. How are you? We will start our class at 9.30pm
14/04/2026, 20:27 - Bilal Stdd: Good eveningg
14/04/2026, 20:28 - Bilal Stdd: I try to be good
14/04/2026, 20:29 - Bilal Stdd: Because today veryy hectic
14/04/2026, 20:29 - B: Do you wanna take off for today's class?
14/04/2026, 20:29 - Bilal Stdd: Npp we can do
14/04/2026, 20:30 - B: Okay perfect. Then see you at 9.30
14/04/2026, 21:26 - Bilal Stdd: Im late 10 minutes is there problem for you
14/04/2026, 21:28 - B: its okay take your time
14/04/2026, 21:28 - B: https://teams.microsoft.com/meet/378564904998291?p=Ix9zTTHG5JLdT731NH
14/04/2026, 21:28 - B: when you are available just join this link
14/04/2026, 23:15 - B: Thank you for joining. I will see you. Have a good evening.
14/04/2026, 23:16 - Bilal Stdd: Thank you so much see you good night
16/04/2026, 13:42 - Bilal Stdd: Helloo
16/04/2026, 13:42 - Bilal Stdd: Is there lesson today?
16/04/2026, 13:43 - B: Hy. No dear.
16/04/2026, 13:43 - Bilal Stdd: Okeyyy
21/04/2026, 17:14 - Bilal Stdd: Hello teacher have we lesson today?
21/04/2026, 17:50 - B: Yes we have a lesson
21/04/2026, 18:39 - Bilal Stdd: :(
21/04/2026, 18:45 - B: Do you wanna go to your friends?
21/04/2026, 18:48 - Bilal Stdd: I dont know today confusing for my work will finish late
21/04/2026, 20:05 - Bilal Stdd: I want say something
21/04/2026, 20:06 - Bilal Stdd: If you dont get angrryy
21/04/2026, 20:06 - B: Yes. Say it
21/04/2026, 20:06 - Bilal Stdd: If youu dont beatt me
21/04/2026, 20:08 - Bilal Stdd: We make lesson another day :(
21/04/2026, 20:14 - B: No no its okay you can go. We can make on friday or Saturday
21/04/2026, 21:12 - Bilal Stdd: My friends have birthday teacher
21/04/2026, 21:13 - B: Hahah tamam enjoy dear no problem. We will have our lesson on Friday. Happy birthday to him.
23/04/2026, 17:35 - B: Hey. Today we are not having any class.
23/04/2026, 17:47 - Bilal Stdd: Okeyyy teacherrr. Thank you
28/04/2026, 21:08 - B: https://teams.microsoft.com/meet/398269429277935?p=dwyK37sdGtjSw7MHt9
28/04/2026, 21:09 - Bilal Stdd: Whenn
28/04/2026, 21:09 - B: now
28/04/2026, 21:27 - Bilal Stdd: Im coming 5 minute
28/04/2026, 22:01 - B: I am back. Lets join
28/04/2026, 22:02 - Bilal Stdd: Okss
30/04/2026, 19:48 - Bilal Stdd: Helloo teacherr. Have we lesson?
30/04/2026, 19:56 - B: Hey. Yes we will have
30/04/2026, 20:35 - Bilal Stdd: 9?
30/04/2026, 20:38 - B: 9.30 today. I am in the metrobus rightnow
30/04/2026, 20:38 - Bilal Stdd: Okksss
30/04/2026, 21:33 - B: https://teams.microsoft.com/meet/384410580024893?p=29KgE4Q6hEKnURfPmZ
30/04/2026, 21:34 - Bilal Stdd: Im comingg
05/05/2026, 16:45 - Bilal Stdd: Teacherr
05/05/2026, 16:45 - B: Yes
05/05/2026, 16:46 - Bilal Stdd: Im in bursa
05/05/2026, 16:46 - B: So you wont be able to take class?
05/05/2026, 19:41 - Bilal Stdd: Yess
05/05/2026, 19:58 - B: Ok
07/05/2026, 19:36 - Bilal Stdd: Today 9?
07/05/2026, 19:36 - B: 9.30
07/05/2026, 19:36 - Bilal Stdd: Okey
07/05/2026, 21:31 - Bilal Stdd: Whereee areee youuuu
07/05/2026, 21:32 - B: talking to ur cousin
07/05/2026, 21:33 - Bilal Stdd: She is not my cousin
07/05/2026, 21:33 - B: https://teams.microsoft.com/meet/340202738013437?p=or37plzKIx1Vx6SHCg
12/05/2026, 11:24 - B: Heyaa. Today the class will be at 11.30
12/05/2026, 11:25 - Bilal Stdd: Hello this night. Okey
12/05/2026, 23:37 - B: Hey
12/05/2026, 23:46 - Bilal Stdd: Teacher im sorry im hospital now
12/05/2026, 23:47 - Bilal Stdd: Kulaklarim basincli ve isitme olarak bi sikinti var
12/05/2026, 23:47 - Bilal Stdd: Kafami agritiyor
12/05/2026, 23:47 - Bilal Stdd: Yazamadim haber veremedim. Ozur dilerim
12/05/2026, 23:49 - B: Oh get well soon. No worries
14/05/2026, 18:15 - Bilal Stdd: Helloo teacher. Today have we lesson
14/05/2026, 19:35 - B: Are you okay? Your ears are fine now?
14/05/2026, 20:08 - Bilal Stdd: Better than tuesday i use medicine
14/05/2026, 20:08 - Bilal Stdd: But im ill
14/05/2026, 20:46 - B: Oky then lets cancel todays class`;

const mustafaChat = `05/04/2026, 22:00 - B: Hey Mustafa. How are you doing. I am Brishna, i will be your english teacher.
05/04/2026, 22:05 - B: Our lesson starts tomorrow at 9.30 am.
05/04/2026, 22:23 - Mustafa Std: Hello, good evening, nice to meet you. Thank you
06/04/2026, 09:27 - B: Good Morning.
06/04/2026, 09:27 - B: https://teams.live.com/meet/9369835736250?p=uDsKveMm755xZbVBPP
06/04/2026, 09:27 - B: here is a link. you can join
06/04/2026, 09:27 - Mustafa Std: Good morning. Okey
07/04/2026, 21:33 - Mustafa Std: Hello. Good evening
07/04/2026, 21:42 - B: Hey
07/04/2026, 21:49 - Mustafa Std: Teacher, I apologize for disturbing you. Do we have class tomorrow?
07/04/2026, 22:01 - B: No problem. Yes we have
07/04/2026, 22:02 - B: IMG-20260407-WA0065.jpg (file attached)
07/04/2026, 22:02 - B: Your schedule
07/04/2026, 22:03 - Mustafa Std: Thank you. I will present the cake design I made tomorrow. I need to go to school early.
07/04/2026, 22:06 - Mustafa Std: Is it possible to do this on Friday?
07/04/2026, 22:07 - B: So you wont be able to take class tomorrow?
07/04/2026, 22:46 - B: Okay no problem. Then tomorrow no class
07/04/2026, 22:47 - Mustafa Std: Thanks, see you on Friday.
07/04/2026, 23:50 - B: See ya. Goodluck with your presentation
07/04/2026, 23:51 - Mustafa Std: Thank you very much
10/04/2026, 09:28 - B: https://teams.microsoft.com/meet/397796087540542?p=GgOWkHIgtB0spVine8
10/04/2026, 09:28 - Mustafa Std: Hello
10/04/2026, 09:28 - B: hey goodmorning
10/04/2026, 10:19 - Mustafa Std: Did we take a break?
10/04/2026, 13:21 - B: noun_types_homework_Mustafa.pdf (file attached)
10/04/2026, 13:21 - Mustafa Std: Thank you. My teacher. Very very thank you
13/04/2026, 09:24 - Mustafa Std: Good morning, teacher. I got sick today, I have a sore throat. I've taken my medicine and I'm going to bed.
13/04/2026, 09:26 - B: Good morning. Oh okay okay get well soon.
13/04/2026, 09:27 - Mustafa Std: Thank you
14/04/2026, 23:36 - Mustafa Std: Good evening, my food presentation will be tomorrow at 11:00.
15/04/2026, 00:04 - B: So no class tomorrow?
15/04/2026, 00:12 - Mustafa Std: Yes, it's another school presentation day for me.
15/04/2026, 00:21 - B: Ok. Good luck.
15/04/2026, 00:21 - Mustafa Std: Thank you my teacher
17/04/2026, 03:41 - B: Hey. How are you? Tomorrow there isn't any class. I am out of city.
17/04/2026, 08:30 - Mustafa Std: I m very well. You
17/04/2026, 10:35 - B: I am good too
20/04/2026, 00:42 - Mustafa Std: Hello
20/04/2026, 00:43 - Mustafa Std: How are you teacher
20/04/2026, 00:43 - B: I am good. How about you.
20/04/2026, 00:43 - Mustafa Std: I m very well. I have a doctor's appointment tomorrow, I just wanted to let you know.
20/04/2026, 00:44 - B: Okay np. Get well soon
20/04/2026, 00:45 - Mustafa Std: Everything piled up at once: my school life, my hospital appointments. Thank you
20/04/2026, 00:45 - B: Yeah i can understand. Take your time.
21/04/2026, 23:09 - Mustafa Std: Teacher, can we change the class schedule? My class on Wednesday has been moved to 12.
21/04/2026, 23:11 - B: Lets do this. You can make a schedule for your classes and then we can continue accordingly.
21/04/2026, 23:11 - Mustafa Std: Could it be on Wednesday evenings?
21/04/2026, 23:15 - Mustafa Std: Would 9 PM on Wednesday evening be suitable?
21/04/2026, 23:16 - B: I already have lesson at that time.
21/04/2026, 23:17 - B: How about 11.30pm? Til 1?
21/04/2026, 23:18 - Mustafa Std: Yessss. Very good. Thank you my teacher
21/04/2026, 23:18 - B: Perfect. Then see you tomorrow at 11.30
22/04/2026, 22:59 - Mustafa Std: Good evening
22/04/2026, 22:59 - B: Hey good evenings
22/04/2026, 22:59 - Mustafa Std: I'm on my way, I haven't been able to get home yet.
22/04/2026, 23:00 - B: How much will it take
22/04/2026, 23:00 - Mustafa Std: 45 minutes, teacher.
22/04/2026, 23:01 - B: If you are tired we can reschedule our class
22/04/2026, 23:02 - Mustafa Std: Teacher, can I let you know when I get home?
23/04/2026, 00:05 - Mustafa Std: Yes, I've arrived. Teacher
23/04/2026, 00:06 - B: Are you fine taking class now?
23/04/2026, 00:07 - Mustafa Std: It is possible
23/04/2026, 00:14 - B: Wait my laptop is not working. I am trying to open it
23/04/2026, 00:15 - Mustafa Std: If there are any problems, we can sort them out tomorrow, teacher.
23/04/2026, 00:17 - B: Can we make it on Saturday evening? Tomorrow i have schedule for other student
23/04/2026, 00:19 - B: Friday we have class already. Saturday we can do the makeup class
23/04/2026, 00:22 - Mustafa Std: I might have a class on Saturday.
23/04/2026, 00:23 - B: PTT-20260423-WA0002.opus (file attached)
23/04/2026, 00:23 - B: PTT-20260423-WA0003.opus (file attached)
23/04/2026, 22:46 - B: Hey. How are you? Can we have our class tomorrow in the evening?
23/04/2026, 22:47 - B: I came to sile and now i am stuck here.
23/04/2026, 22:52 - Mustafa Std: Are you alright?
23/04/2026, 23:09 - B: Yeah i am alright. just missed my bus
23/04/2026, 23:10 - Mustafa Std: I'm sorry to hear that. We'll have our lesson tomorrow, teacher.
23/04/2026, 23:12 - B: I will message you when i reach home tomorrow
24/04/2026, 17:19 - B: Hey. Are you free at 10pm?
24/04/2026, 18:21 - Mustafa Std: Unfortunately, I'm not available right now. But it will be around 23:55.
24/04/2026, 18:26 - B: Okay. Let me know if you want to take class at that time.
26/04/2026, 16:05 - Mustafa Std: Teacher. Hello. How are you. Tomorrow class 9am morning
26/04/2026, 16:06 - B: Hey. I am good. How about you?
26/04/2026, 16:07 - B: Yes 9am in the morning
26/04/2026, 16:07 - Mustafa Std: Thank you, teacher. See you
27/04/2026, 08:50 - B: Good morning. Do you wanna take the class now or in the evening?
27/04/2026, 08:55 - Mustafa Std: whatever suits you. Teacher
27/04/2026, 09:01 - Mustafa Std: Our classes today are from 9:00 to 11:00, right?
27/04/2026, 09:05 - B: Yeah
27/04/2026, 09:14 - B: https://teams.microsoft.com/meet/371296961427829?p=6mdJQMOGZr1GEvJlMq
27/04/2026, 10:31 - B: Pronouns-1.docx (file attached)
27/04/2026, 10:34 - B: pronouns_homework.docx (file attached)
28/04/2026, 21:25 - Mustafa Std: Hi, hello good evening. Tomorrow classes 9am.
28/04/2026, 21:26 - B: Yes. 9am
28/04/2026, 21:28 - Mustafa Std: Could it be between 8:00 and 10:00 tomorrow morning?
28/04/2026, 21:29 - B: 8.30 to 10.30?
28/04/2026, 21:30 - Mustafa Std: Yes
29/04/2026, 08:29 - B: https://teams.microsoft.com/meet/368060773494968?p=PZIt7YhZgpIBJ73NDg
29/04/2026, 09:31 - Mustafa Std: Teacher. Can we finish the lesson early? I need to go see my brother.
29/04/2026, 09:35 - B: Verb-1.docx (file attached)
29/04/2026, 09:35 - B: VerbFormsEnglishLanguageLearnersAccessibleFebruary2020.pdf (file attached)
29/04/2026, 09:39 - B: verb_homework.docx (file attached)
30/04/2026, 23:59 - Mustafa Std: Hello, good evening. Can we postpone our class tomorrow?
01/05/2026, 00:02 - B: Hey. Yeah sure. we dont have a class. Tomorrow is a public holiday. So no class tomorrow
01/05/2026, 00:05 - Mustafa Std: Okay, thank you teacher.
04/05/2026, 09:17 - Mustafa Std: Hello, good morning. I was very ill.
04/05/2026, 09:18 - B: Good morning. How are you feeling now?
04/05/2026, 09:21 - Mustafa Std: PTT-20260504-WA0011.opus (file attached)
04/05/2026, 09:27 - B: Oh yeah you sound bad. Rest well and get well soon.
04/05/2026, 09:29 - B: I think you won't be able to take class today.
04/05/2026, 09:30 - Mustafa Std: Yes, I'm sorry, I won't be able to attend the class. Both my throat and nose hurt.
04/05/2026, 09:32 - B: Gecmis olsun.
04/05/2026, 09:34 - Mustafa Std: Tesekkur ederim kusura bakmayin Bagisikligim dusuk oldugu icin surekli hasta oluyorum
05/05/2026, 16:52 - B: Hey how are you doing
05/05/2026, 16:54 - B: This week and next week, i won't be able to take class in the morning, so can we switch to Tuesday and Thursday evening?
05/05/2026, 16:54 - Mustafa Std: I'm not well, I'm sick. Okey. No problem
05/05/2026, 16:57 - Mustafa Std: I don't know, I have a fever and it won't go down.
05/05/2026, 17:00 - B: Get well soon dear
06/05/2026, 20:09 - B: Hey. Tomorrow at what time are you available?
06/05/2026, 21:33 - Mustafa Std: I'll tell you right away.
07/05/2026, 09:21 - Mustafa Std: Good morning. My shift starts at 11:00 today.
07/05/2026, 09:24 - B: And when are you available in the evening
07/05/2026, 09:25 - Mustafa Std: 12:30 PM
07/05/2026, 09:26 - B: Lets do then
08/05/2026, 00:07 - B: Hy. Did you reach home?
08/05/2026, 00:08 - Mustafa Std: No, I'm on my way.
08/05/2026, 00:09 - Mustafa Std: I have some lesson plans for this week; can we do them next week?
08/05/2026, 00:10 - B: Yeah sure. You can send me the time
08/05/2026, 00:11 - Mustafa Std: Okay, I'll write to you tomorrow, teacher. Good night
08/05/2026, 00:12 - B: Good night
10/05/2026, 21:24 - Mustafa Std: Hello, good evening. How are you, my teacher? Tomorrow lesson 9:30 am. True
10/05/2026, 21:43 - B: Hello. No dear tomorrow in the evening. We will start morning classes from next week
10/05/2026, 22:08 - Mustafa Std: Okey. Thank you my teacher
13/05/2026, 13:31 - B: Hello. How are you? When are you free today?
13/05/2026, 13:46 - Mustafa Std: My brother passed away.
13/05/2026, 13:47 - B: When? My condolences.
13/05/2026, 13:48 - B: If you want anything let me know
13/05/2026, 13:53 - Mustafa Std: Thank you so much, teacher. I'm so happy to have you here. Thank you for your kind wishes.
13/05/2026, 13:54 - B: Take care`;

async function main() {
  console.log("Seeding WhatsApp chat history...\n");

  // Clear existing WhatsApp data
  await db.whatsappMessage.deleteMany();
  await db.whatsappConversation.deleteMany();
  console.log("Cleared existing WhatsApp data\n");

  const chats = [
    { key: "esra", label: "Esra Std", raw: esraChat },
    { key: "ayse", label: "Ayse Std", raw: ayseChat },
    { key: "fatmagul", label: "Fatmagul Std", raw: fatmagulChat },
    { key: "bilal", label: "Bilal Stdd", raw: bilalChat },
    { key: "mustafa", label: "Mustafa Std", raw: mustafaChat },
  ];

  for (const chat of chats) {
    const student = students[chat.key as keyof typeof students];
    const messages = parseChat(chat.raw, chat.label);

    console.log(`${student.name}: ${messages.length} messages parsed`);

    // Create conversation
    const conversation = await db.whatsappConversation.create({
      data: {
        phoneNumber: student.phone,
        userId: student.id,
        conversationType: "STUDENT",
        lastMessageAt: messages.length > 0 ? messages[messages.length - 1].date : new Date(),
        isActive: true,
        context: JSON.stringify({
          studentName: student.name,
          teacherName: "Brishna",
          importedFrom: "WhatsApp Chat Export",
          importedAt: new Date().toISOString(),
          totalMessages: messages.length,
        }),
      },
    });

    // Create all messages
    for (const msg of messages) {
      await db.whatsappMessage.create({
        data: {
          conversationId: conversation.id,
          direction: msg.sender === "teacher" ? "OUTBOUND" : "INBOUND",
          content: msg.content,
          messageType: msg.messageType,
          sentAt: msg.date,
          deliveredAt: msg.date,
          readAt: msg.date,
        },
      });
    }

    console.log(`  -> Created conversation + ${messages.length} messages\n`);
  }

  console.log("WhatsApp chat seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
