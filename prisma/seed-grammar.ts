import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function seedGrammar() {
  console.log("Seeding grammar content...");

  // Delete existing grammar data
  await db.exerciseAttempt.deleteMany();
  await db.studentGrammarProgress.deleteMany();
  await db.grammarAssignment.deleteMany();
  await db.grammarExercise.deleteMany();
  await db.grammarLesson.deleteMany();
  await db.grammarTopic.deleteMany();
  await db.grammarCategory.deleteMany();

  console.log("Cleared existing grammar data.");

  // ============================================================
  // CATEGORY 1: Parts of Speech
  // ============================================================
  const cat1 = await db.grammarCategory.create({
    data: {
      name: "Parts of Speech",
      slug: "parts-of-speech",
      description: "Learn the fundamental building blocks of English grammar",
      icon: "Type",
      order: 1,
    },
  });

  // --- Topic 1.1: Nouns ---
  const t1_1 = await db.grammarTopic.create({
    data: {
      categoryId: cat1.id,
      title: "Nouns",
      slug: "nouns",
      description: "Words that name people, places, things, and ideas",
      level: "beginner",
      order: 1,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t1_1.id,
      content: `# Nouns

A **noun** is a word that names a person, place, thing, or idea. Nouns are one of the most important parts of speech because they serve as the subjects and objects of sentences.

## Types of Nouns

### 1. Common Nouns
Common nouns name general, non-specific people, places, things, or ideas. They are not capitalized unless they start a sentence.
- **People:** teacher, doctor, girl, boy
- **Places:** city, park, school, country
- **Things:** book, table, phone, car
- **Ideas:** freedom, love, happiness, courage

### 2. Proper Nouns
Proper nouns name specific people, places, or things. They are always capitalized.
- **People:** Albert Einstein, Shakespeare
- **Places:** Istanbul, Turkey, Central Park
- **Things:** Nike, Toyota, Monday, January

### 3. Concrete Nouns
Concrete nouns name things you can experience with your five senses.
- water, music, flower, chocolate, silk

### 4. Abstract Nouns
Abstract nouns name ideas, qualities, or states that cannot be perceived with the senses.
- knowledge, beauty, anger, time, childhood

### 5. Countable and Uncountable Nouns
Countable nouns can be counted (one book, two books). Uncountable nouns cannot be counted individually (water, information, advice).

### 6. Collective Nouns
Collective nouns name groups: a team, a family, a flock, a bunch.

## Noun Functions in Sentences
- **Subject:** The **dog** barked loudly.
- **Direct Object:** She read the **book**.
- **Indirect Object:** He gave **Maria** a gift.
- **Object of a Preposition:** The cat sat on the **table**.`,
      examples: JSON.stringify([
        "The **teacher** explained the lesson carefully.",
        "**Happiness** is the key to a good life.",
        "We visited **Istanbul** last summer.",
        "A **flock** of birds flew across the sky.",
        "She gave her **brother** a present.",
        "The **information** was very useful."
      ]),
      tips: "To test if a word is a noun, try putting 'the' or 'a' in front of it. If it makes sense (the happiness, a dog), it is likely a noun. Many nouns end in suffixes like -tion, -ness, -ment, -ity (education, kindness, movement, creativity).",
    },
  });
  for (const ex of [
    { topicId: t1_1.id, type: "multiple_choice", difficulty: "beginner", question: "Which word is a noun?", options: JSON.stringify(["quickly", "beautiful", "garden", "run"]), correctAnswer: "garden", explanation: "'Garden' is a noun because it names a place/thing. 'Quickly' is an adverb, 'beautiful' is an adjective, and 'run' here is a verb.", order: 1 },
    { topicId: t1_1.id, type: "multiple_choice", difficulty: "beginner", question: "Which of the following is an abstract noun?", options: JSON.stringify(["table", "courage", "river", "cat"]), correctAnswer: "courage", explanation: "'Courage' is an abstract noun because it names a quality that cannot be seen or touched.", order: 2 },
    { topicId: t1_1.id, type: "multiple_choice", difficulty: "beginner", question: "Which is a proper noun?", options: JSON.stringify(["city", "London", "dog", "book"]), correctAnswer: "London", explanation: "'London' is a proper noun because it names a specific city. Proper nouns are always capitalized.", order: 3 },
    { topicId: t1_1.id, type: "fill_in_blank", difficulty: "beginner", question: "She has a lot of ___ about history.", correctAnswer: "knowledge|information", explanation: "'Knowledge' and 'information' are uncountable abstract nouns that fit this context.", order: 4 },
    { topicId: t1_1.id, type: "fill_in_blank", difficulty: "beginner", question: "A ___ of students waited outside the classroom.", correctAnswer: "group|crowd", explanation: "'Group' and 'crowd' are collective nouns used to describe a collection of students.", order: 5 },
    { topicId: t1_1.id, type: "error_correction", difficulty: "beginner", question: "He gave me a good advices about my career.", correctAnswer: "He gave me good advice about my career.", explanation: "'Advice' is an uncountable noun and cannot be made plural. Remove 'a' and change 'advices' to 'advice'.", order: 6 },
    { topicId: t1_1.id, type: "error_correction", difficulty: "beginner", question: "The informations on the website is outdated.", correctAnswer: "The information on the website is outdated.", explanation: "'Information' is an uncountable noun and does not take a plural form.", order: 7 },
    { topicId: t1_1.id, type: "sentence_rewrite", difficulty: "beginner", question: "Rewrite using a noun form of 'happy': She felt happy when she heard the news.", correctAnswer: "She felt happiness when she heard the news.|Happiness filled her when she heard the news.", explanation: "The noun form of the adjective 'happy' is 'happiness'.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 1.2: Pronouns ---
  const t1_2 = await db.grammarTopic.create({
    data: {
      categoryId: cat1.id,
      title: "Pronouns",
      slug: "pronouns",
      description: "Words that replace nouns to avoid repetition",
      level: "beginner",
      order: 2,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t1_2.id,
      content: `# Pronouns

A **pronoun** is a word that takes the place of a noun. Pronouns help us avoid repeating the same noun over and over.

## Types of Pronouns

### 1. Personal Pronouns
Personal pronouns refer to specific people or things.
- **Subject pronouns:** I, you, he, she, it, we, they
- **Object pronouns:** me, you, him, her, it, us, them

### 2. Possessive Pronouns
Possessive pronouns show ownership.
- mine, yours, his, hers, its, ours, theirs
- Do not confuse with possessive adjectives: my, your, his, her, its, our, their

### 3. Reflexive Pronouns
Reflexive pronouns refer back to the subject.
- myself, yourself, himself, herself, itself, ourselves, yourselves, themselves

### 4. Demonstrative Pronouns
Demonstrative pronouns point to specific things.
- this, that, these, those

### 5. Relative Pronouns
Relative pronouns introduce relative clauses.
- who, whom, whose, which, that

### 6. Indefinite Pronouns
Indefinite pronouns refer to non-specific people or things.
- someone, anybody, nothing, everyone, each, either, neither, all, some

### 7. Interrogative Pronouns
Interrogative pronouns are used to ask questions.
- who, whom, whose, which, what`,
      examples: JSON.stringify([
        "**She** is my best friend. (subject pronoun)",
        "The teacher gave **them** homework. (object pronoun)",
        "This book is **mine**. (possessive pronoun)",
        "He taught **himself** to play guitar. (reflexive pronoun)",
        "**Those** are my shoes. (demonstrative pronoun)",
        "The student **who** studied hard passed the exam. (relative pronoun)"
      ]),
      tips: "Make sure the pronoun clearly refers to the correct noun (its antecedent). Unclear pronoun reference is one of the most common writing errors. Example of unclear reference: 'Tom told Jerry that he was late.' (Who was late?)",
    },
  });
  for (const ex of [
    { topicId: t1_2.id, type: "multiple_choice", difficulty: "beginner", question: "Which is the correct object pronoun? 'The teacher helped ___ with the project.'", options: JSON.stringify(["I", "me", "my", "mine"]), correctAnswer: "me", explanation: "'Me' is the object pronoun. After a verb like 'helped', we use the object form.", order: 1 },
    { topicId: t1_2.id, type: "multiple_choice", difficulty: "beginner", question: "Which is a possessive pronoun?", options: JSON.stringify(["him", "his", "he", "himself"]), correctAnswer: "his", explanation: "'His' can function as a possessive pronoun (e.g., 'The book is his'). 'Him' is an object pronoun, 'he' is a subject pronoun, and 'himself' is reflexive.", order: 2 },
    { topicId: t1_2.id, type: "multiple_choice", difficulty: "beginner", question: "Choose the correct reflexive pronoun: 'She made ___ a cup of tea.'", options: JSON.stringify(["her", "hers", "herself", "she"]), correctAnswer: "herself", explanation: "'Herself' is the reflexive pronoun for 'she'. It shows the subject and object are the same person.", order: 3 },
    { topicId: t1_2.id, type: "fill_in_blank", difficulty: "beginner", question: "This is my pen. That one is ___.", correctAnswer: "yours|hers|his|theirs", explanation: "A possessive pronoun is needed to show ownership without repeating 'pen'.", order: 4 },
    { topicId: t1_2.id, type: "fill_in_blank", difficulty: "beginner", question: "___ is knocking at the door.", correctAnswer: "Someone|Somebody", explanation: "An indefinite pronoun like 'someone' or 'somebody' is needed for an unspecified person.", order: 5 },
    { topicId: t1_2.id, type: "error_correction", difficulty: "beginner", question: "Me and my friend went to the cinema.", correctAnswer: "My friend and I went to the cinema.", explanation: "When the pronoun is a subject, use 'I', not 'me'. Also, it is polite to put the other person first.", order: 6 },
    { topicId: t1_2.id, type: "error_correction", difficulty: "beginner", question: "Everyone should bring their own books. Each student must do it themself.", correctAnswer: "Everyone should bring their own books. Each student must do it themselves.", explanation: "'Themselves' is the standard reflexive form used with singular 'they/their' in modern English.", order: 7 },
    { topicId: t1_2.id, type: "sentence_rewrite", difficulty: "beginner", question: "Replace the underlined nouns with pronouns: 'Sarah told Sarah's mother that Sarah would be late.'", correctAnswer: "She told her mother that she would be late.", explanation: "Replace 'Sarah' (subject) with 'she' and 'Sarah's' (possessive) with 'her'.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 1.3: Verbs ---
  const t1_3 = await db.grammarTopic.create({
    data: {
      categoryId: cat1.id,
      title: "Verbs",
      slug: "verbs",
      description: "Words that express actions, states, or occurrences",
      level: "beginner",
      order: 3,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t1_3.id,
      content: `# Verbs

A **verb** is a word that expresses an action, a state of being, or an occurrence. Every complete sentence must contain at least one verb.

## Types of Verbs

### 1. Action Verbs
Action verbs describe physical or mental actions.
- **Physical:** run, jump, write, eat, dance
- **Mental:** think, believe, imagine, understand, remember

### 2. Linking Verbs
Linking verbs connect the subject to more information about the subject. They do not show action.
- be (am, is, are, was, were), seem, appear, become, feel, look, sound, taste, smell

### 3. Auxiliary (Helping) Verbs
Auxiliary verbs help the main verb form tenses, questions, or negatives.
- **Primary auxiliaries:** be, have, do
- **Modal auxiliaries:** can, could, may, might, must, shall, should, will, would

### 4. Transitive and Intransitive Verbs
- **Transitive:** requires a direct object — She kicked **the ball**.
- **Intransitive:** does not take a direct object — He **laughed**.

### 5. Regular and Irregular Verbs
- **Regular:** form past tense by adding -ed (walk → walked, play → played)
- **Irregular:** change form unpredictably (go → went, eat → ate, buy → bought)

## Verb Forms
Every verb has five forms:
1. **Base form:** go, play, write
2. **Third person singular (present):** goes, plays, writes
3. **Past simple:** went, played, wrote
4. **Present participle (-ing):** going, playing, writing
5. **Past participle:** gone, played, written`,
      examples: JSON.stringify([
        "She **runs** every morning. (action verb)",
        "He **is** a doctor. (linking verb)",
        "They **have eaten** lunch. (auxiliary + main verb)",
        "I **bought** a new phone yesterday. (irregular past tense)",
        "The baby **is sleeping** peacefully. (present participle)",
        "The letter **was written** by the manager. (past participle in passive)"
      ]),
      tips: "To identify a verb, ask: Can I do it? Can I be it? If you can say 'I run', 'I think', or 'I am', those words are verbs. Also remember: every sentence needs a verb. If a group of words has no verb, it is not a complete sentence.",
    },
  });
  for (const ex of [
    { topicId: t1_3.id, type: "multiple_choice", difficulty: "beginner", question: "Which word is a verb in: 'The cat quickly climbed the tall tree.'?", options: JSON.stringify(["cat", "quickly", "climbed", "tall"]), correctAnswer: "climbed", explanation: "'Climbed' is the verb because it describes the action the cat performed.", order: 1 },
    { topicId: t1_3.id, type: "multiple_choice", difficulty: "beginner", question: "Which is a linking verb?", options: JSON.stringify(["run", "seem", "write", "eat"]), correctAnswer: "seem", explanation: "'Seem' is a linking verb. It connects the subject to a description (e.g., 'She seems happy').", order: 2 },
    { topicId: t1_3.id, type: "multiple_choice", difficulty: "beginner", question: "What is the past tense of 'go'?", options: JSON.stringify(["goed", "went", "gone", "going"]), correctAnswer: "went", explanation: "'Go' is an irregular verb. Its past simple form is 'went', not 'goed'.", order: 3 },
    { topicId: t1_3.id, type: "fill_in_blank", difficulty: "beginner", question: "She ___ to the store yesterday.", correctAnswer: "went|walked|drove", explanation: "A past tense action verb is needed to complete this sentence about yesterday.", order: 4 },
    { topicId: t1_3.id, type: "fill_in_blank", difficulty: "beginner", question: "The soup ___ delicious.", correctAnswer: "tastes|smells|is", explanation: "A linking verb connects 'soup' to the adjective 'delicious'.", order: 5 },
    { topicId: t1_3.id, type: "error_correction", difficulty: "beginner", question: "She goed to the market last night.", correctAnswer: "She went to the market last night.", explanation: "'Go' is an irregular verb. The past tense is 'went', not 'goed'.", order: 6 },
    { topicId: t1_3.id, type: "error_correction", difficulty: "beginner", question: "He have finished his homework already.", correctAnswer: "He has finished his homework already.", explanation: "With third-person singular subjects (he, she, it), the auxiliary verb 'have' becomes 'has'.", order: 7 },
    { topicId: t1_3.id, type: "sentence_rewrite", difficulty: "beginner", question: "Change to past tense: 'They eat breakfast at 7 AM.'", correctAnswer: "They ate breakfast at 7 AM.", explanation: "'Eat' is an irregular verb. Its past simple form is 'ate'.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 1.4: Adjectives ---
  const t1_4 = await db.grammarTopic.create({
    data: {
      categoryId: cat1.id,
      title: "Adjectives",
      slug: "adjectives",
      description: "Words that describe or modify nouns",
      level: "beginner",
      order: 4,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t1_4.id,
      content: `# Adjectives

An **adjective** is a word that describes or modifies a noun or pronoun. Adjectives give more information about a noun's size, shape, age, color, origin, material, or quality.

## Position of Adjectives

### 1. Before a Noun (Attributive Position)
- She wore a **beautiful** dress.
- He lives in a **small** house.

### 2. After a Linking Verb (Predicative Position)
- The movie was **interesting**.
- She looks **tired**.

## Order of Adjectives
When multiple adjectives are used, they follow this order:
**Opinion → Size → Age → Shape → Color → Origin → Material → Purpose**
- A **lovely small old round brown Turkish wooden** dining table.
- In practice, we rarely use more than 2-3 adjectives together.

## Types of Adjectives
- **Descriptive:** big, happy, cold, expensive
- **Quantitative:** some, many, few, several, three
- **Demonstrative:** this, that, these, those
- **Possessive:** my, your, his, her, its, our, their
- **Interrogative:** which, what, whose

## Comparative and Superlative Forms
- **Short adjectives:** tall → taller → tallest
- **Long adjectives:** beautiful → more beautiful → most beautiful
- **Irregular:** good → better → best, bad → worse → worst`,
      examples: JSON.stringify([
        "She has a **big red** car. (size + color before noun)",
        "The weather is **beautiful** today. (after linking verb)",
        "He is the **tallest** boy in the class. (superlative)",
        "This is a **more interesting** book than that one. (comparative)",
        "They live in an **old Italian** villa. (age + origin)",
        "She bought **three expensive** dresses. (quantitative + descriptive)"
      ]),
      tips: "Remember the order of adjectives with the mnemonic OSASCOMP: Opinion, Size, Age, Shape, Color, Origin, Material, Purpose. Native speakers instinctively follow this order, and it sounds wrong when the order is changed.",
    },
  });
  for (const ex of [
    { topicId: t1_4.id, type: "multiple_choice", difficulty: "beginner", question: "Which word is an adjective in: 'The tall man walked slowly.'?", options: JSON.stringify(["man", "tall", "walked", "slowly"]), correctAnswer: "tall", explanation: "'Tall' is an adjective because it describes the noun 'man'. 'Slowly' is an adverb describing how he walked.", order: 1 },
    { topicId: t1_4.id, type: "multiple_choice", difficulty: "beginner", question: "What is the correct order? 'She has a ___ bag.'", options: JSON.stringify(["leather Italian beautiful", "beautiful Italian leather", "Italian beautiful leather", "beautiful leather Italian"]), correctAnswer: "beautiful Italian leather", explanation: "The correct order follows Opinion (beautiful) + Origin (Italian) + Material (leather).", order: 2 },
    { topicId: t1_4.id, type: "multiple_choice", difficulty: "beginner", question: "What is the superlative form of 'good'?", options: JSON.stringify(["gooder", "more good", "best", "goodest"]), correctAnswer: "best", explanation: "'Good' is an irregular adjective: good → better → best.", order: 3 },
    { topicId: t1_4.id, type: "fill_in_blank", difficulty: "beginner", question: "This exam is ___ than the last one.", correctAnswer: "harder|easier|longer", explanation: "A comparative adjective is needed when comparing two things using 'than'.", order: 4 },
    { topicId: t1_4.id, type: "fill_in_blank", difficulty: "beginner", question: "She is the ___ student in the school.", correctAnswer: "best|smartest|tallest", explanation: "A superlative adjective with 'the' is needed when comparing one to all others in a group.", order: 5 },
    { topicId: t1_4.id, type: "error_correction", difficulty: "beginner", question: "She is more taller than her sister.", correctAnswer: "She is taller than her sister.", explanation: "Short adjectives like 'tall' use -er for comparatives. Do not use 'more' with -er forms.", order: 6 },
    { topicId: t1_4.id, type: "error_correction", difficulty: "beginner", question: "He bought a red big car.", correctAnswer: "He bought a big red car.", explanation: "Size (big) comes before color (red) in the standard adjective order.", order: 7 },
    { topicId: t1_4.id, type: "sentence_rewrite", difficulty: "beginner", question: "Rewrite with the comparative form: 'This book is interesting. That book is not interesting.'", correctAnswer: "This book is more interesting than that book.|This book is more interesting than that one.", explanation: "'Interesting' is a long adjective, so the comparative is 'more interesting'.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 1.5: Adverbs ---
  const t1_5 = await db.grammarTopic.create({
    data: {
      categoryId: cat1.id,
      title: "Adverbs",
      slug: "adverbs",
      description: "Words that modify verbs, adjectives, or other adverbs",
      level: "beginner",
      order: 5,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t1_5.id,
      content: `# Adverbs

An **adverb** is a word that modifies a verb, an adjective, or another adverb. Adverbs tell us how, when, where, how often, or to what degree something happens.

## Types of Adverbs

### 1. Adverbs of Manner (How?)
These describe how an action is performed. Most are formed by adding -ly to an adjective.
- slow → slowly, careful → carefully, happy → happily
- **Exceptions:** fast, hard, well, late, early (same form as adjective)

### 2. Adverbs of Time (When?)
- now, then, today, yesterday, tomorrow, soon, already, yet, still, recently

### 3. Adverbs of Place (Where?)
- here, there, everywhere, outside, upstairs, nearby, away

### 4. Adverbs of Frequency (How often?)
- always, usually, often, sometimes, rarely, seldom, never
- Frequency adverbs usually go before the main verb but after 'be'.

### 5. Adverbs of Degree (How much?)
- very, extremely, quite, rather, fairly, too, enough, almost, nearly

## Position of Adverbs
- **Before the main verb:** She **always** arrives on time.
- **After the verb 'be':** He is **usually** late.
- **At the beginning or end:** **Yesterday**, I went shopping. / I went shopping **yesterday**.
- **Before an adjective:** She is **very** smart.`,
      examples: JSON.stringify([
        "She sings **beautifully**. (manner)",
        "I will call you **tomorrow**. (time)",
        "The children played **outside**. (place)",
        "He **always** drinks coffee in the morning. (frequency)",
        "This test is **extremely** difficult. (degree)",
        "She **almost** missed the bus. (degree)"
      ]),
      tips: "Not all adverbs end in -ly! Words like 'fast', 'hard', 'well', 'late', and 'early' are adverbs too. Also, some -ly words are actually adjectives: friendly, lovely, lonely, ugly, silly.",
    },
  });
  for (const ex of [
    { topicId: t1_5.id, type: "multiple_choice", difficulty: "beginner", question: "Which word is an adverb in: 'She spoke quietly.'?", options: JSON.stringify(["She", "spoke", "quietly", "none"]), correctAnswer: "quietly", explanation: "'Quietly' is an adverb of manner describing how she spoke.", order: 1 },
    { topicId: t1_5.id, type: "multiple_choice", difficulty: "beginner", question: "Where does the frequency adverb go? '___ she ___ late.'", options: JSON.stringify(["Usually / is", "She / usually is", "Is / usually she", "Usually is / she"]), correctAnswer: "Usually / is", explanation: "Frequency adverbs can go at the beginning of a sentence or after the verb 'be'. 'Usually she is late' or 'She is usually late' are both correct.", order: 2 },
    { topicId: t1_5.id, type: "multiple_choice", difficulty: "beginner", question: "Which is the adverb form of 'happy'?", options: JSON.stringify(["happyly", "happily", "happier", "happiness"]), correctAnswer: "happily", explanation: "When an adjective ends in -y, change -y to -i and add -ly: happy → happily.", order: 3 },
    { topicId: t1_5.id, type: "fill_in_blank", difficulty: "beginner", question: "He runs very ___.", correctAnswer: "fast|quickly", explanation: "'Fast' or 'quickly' are adverbs of manner that describe how he runs.", order: 4 },
    { topicId: t1_5.id, type: "fill_in_blank", difficulty: "beginner", question: "She ___ goes to the gym. She goes five times a week.", correctAnswer: "always|usually|often", explanation: "A frequency adverb is needed to express how often she goes. Since she goes five times a week, 'always', 'usually', or 'often' fits.", order: 5 },
    { topicId: t1_5.id, type: "error_correction", difficulty: "beginner", question: "She sings very good.", correctAnswer: "She sings very well.", explanation: "'Good' is an adjective. To modify a verb ('sings'), we need the adverb 'well'.", order: 6 },
    { topicId: t1_5.id, type: "error_correction", difficulty: "beginner", question: "He drives too much fast.", correctAnswer: "He drives too fast.", explanation: "'Too' already modifies 'fast'. Adding 'much' is redundant and incorrect.", order: 7 },
    { topicId: t1_5.id, type: "sentence_rewrite", difficulty: "beginner", question: "Add an adverb of frequency: 'She is late for class.' (most of the time)", correctAnswer: "She is usually late for class.|She is often late for class.", explanation: "Frequency adverbs go after the verb 'be'. 'Usually' or 'often' means most of the time.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 1.6: Prepositions ---
  const t1_6 = await db.grammarTopic.create({
    data: {
      categoryId: cat1.id,
      title: "Prepositions",
      slug: "prepositions-intro",
      description: "Words that show relationships between nouns and other words",
      level: "beginner",
      order: 6,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t1_6.id,
      content: `# Prepositions

A **preposition** is a word placed before a noun or pronoun to show its relationship to another word in the sentence. Prepositions indicate time, place, direction, cause, manner, and other relationships.

## Common Prepositions

### Time Prepositions
- **at** — specific times: at 5 o'clock, at noon, at night
- **on** — days and dates: on Monday, on January 1st
- **in** — longer periods: in the morning, in 2024, in summer

### Place Prepositions
- **at** — specific points: at the bus stop, at the door
- **on** — surfaces: on the table, on the wall
- **in** — enclosed spaces: in the room, in the box

### Direction Prepositions
- to, from, into, out of, through, across, along, toward

### Other Common Prepositions
- about, above, after, against, among, before, behind, below, beside, between, by, during, for, of, since, under, until, with, without

## Prepositional Phrases
A preposition + its object = a prepositional phrase.
- The book is **on the table**. (preposition + article + noun)
- She walked **through the park**. (preposition + article + noun)

## Important Rules
1. A preposition is always followed by a noun, pronoun, or gerund — never a verb in base form.
   - Correct: She is good **at swimming**.
   - Incorrect: She is good **at swim**.
2. In modern English, ending a sentence with a preposition is acceptable in informal speech.`,
      examples: JSON.stringify([
        "The meeting is **at** 3 PM. (time)",
        "She lives **in** Istanbul. (place)",
        "The cat jumped **onto** the table. (direction)",
        "He has been waiting **since** morning. (time)",
        "She went to school **without** her books. (manner)",
        "The book is **between** the two boxes. (place)"
      ]),
      tips: "A good way to remember time prepositions: AT for specific times (at 6 PM), ON for days and dates (on Friday), IN for longer periods (in March, in 2024). Think: AT a point, ON a surface, IN an area.",
    },
  });
  for (const ex of [
    { topicId: t1_6.id, type: "multiple_choice", difficulty: "beginner", question: "Choose the correct preposition: 'She arrived ___ Monday.'", options: JSON.stringify(["in", "at", "on", "by"]), correctAnswer: "on", explanation: "We use 'on' with days of the week: on Monday, on Friday, on Saturday.", order: 1 },
    { topicId: t1_6.id, type: "multiple_choice", difficulty: "beginner", question: "Which preposition completes: 'The keys are ___ the drawer.'?", options: JSON.stringify(["on", "in", "at", "by"]), correctAnswer: "in", explanation: "We use 'in' for enclosed spaces. A drawer is an enclosed space.", order: 2 },
    { topicId: t1_6.id, type: "multiple_choice", difficulty: "beginner", question: "Which is a preposition in: 'She walked through the forest.'?", options: JSON.stringify(["She", "walked", "through", "forest"]), correctAnswer: "through", explanation: "'Through' is a preposition showing direction — it tells us the path of her walking.", order: 3 },
    { topicId: t1_6.id, type: "fill_in_blank", difficulty: "beginner", question: "I was born ___ 1995.", correctAnswer: "in", explanation: "We use 'in' with years: in 1995, in 2024.", order: 4 },
    { topicId: t1_6.id, type: "fill_in_blank", difficulty: "beginner", question: "The picture is ___ the wall.", correctAnswer: "on", explanation: "We use 'on' for surfaces. A picture hangs on a wall (a surface).", order: 5 },
    { topicId: t1_6.id, type: "error_correction", difficulty: "beginner", question: "I will see you on 5 o'clock.", correctAnswer: "I will see you at 5 o'clock.", explanation: "We use 'at' with specific times, not 'on'. 'On' is for days and dates.", order: 6 },
    { topicId: t1_6.id, type: "error_correction", difficulty: "beginner", question: "She is good at swim.", correctAnswer: "She is good at swimming.", explanation: "After a preposition, use a gerund (-ing form), not the base form of the verb.", order: 7 },
    { topicId: t1_6.id, type: "sentence_rewrite", difficulty: "beginner", question: "Combine using a preposition: 'There is a garden. The garden is behind the house.'", correctAnswer: "There is a garden behind the house.", explanation: "The preposition 'behind' shows the location of the garden relative to the house.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 1.7: Conjunctions ---
  const t1_7 = await db.grammarTopic.create({
    data: {
      categoryId: cat1.id,
      title: "Conjunctions",
      slug: "conjunctions-intro",
      description: "Words that connect words, phrases, and clauses",
      level: "beginner",
      order: 7,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t1_7.id,
      content: `# Conjunctions

A **conjunction** is a word that connects words, phrases, or clauses. Conjunctions help us build longer, more complex sentences.

## Types of Conjunctions

### 1. Coordinating Conjunctions (FANBOYS)
These connect words, phrases, or independent clauses of equal importance.
- **F**or — because/since: She stayed home, **for** she was tired.
- **A**nd — addition: I like tea **and** coffee.
- **N**or — negative addition: She doesn't sing, **nor** does she dance.
- **B**ut — contrast: He is short **but** strong.
- **O**r — alternative: Do you want tea **or** coffee?
- **Y**et — contrast/surprise: It was raining, **yet** we went outside.
- **S**o — result: I was hungry, **so** I made a sandwich.

### 2. Subordinating Conjunctions
These connect a dependent clause to an independent clause.
- **Time:** when, while, before, after, since, until, as soon as
- **Cause/Reason:** because, since, as
- **Condition:** if, unless, provided that
- **Contrast:** although, though, even though, whereas, while
- **Purpose:** so that, in order that

### 3. Correlative Conjunctions
These work in pairs.
- both...and, either...or, neither...nor, not only...but also, whether...or

## Punctuation with Conjunctions
- Use a comma before a coordinating conjunction joining two independent clauses.
- When a subordinating clause comes first, use a comma after it.`,
      examples: JSON.stringify([
        "I want to go, **but** I am too tired. (coordinating)",
        "**Although** it was raining, we went for a walk. (subordinating)",
        "She speaks **both** English **and** Turkish. (correlative)",
        "He studied hard, **so** he passed the exam. (coordinating)",
        "I will wait **until** you arrive. (subordinating)",
        "**Either** you come with us, **or** you stay home. (correlative)"
      ]),
      tips: "Remember FANBOYS to recall the seven coordinating conjunctions: For, And, Nor, But, Or, Yet, So. When joining two complete sentences with a coordinating conjunction, always put a comma before it.",
    },
  });
  for (const ex of [
    { topicId: t1_7.id, type: "multiple_choice", difficulty: "beginner", question: "Which is a coordinating conjunction?", options: JSON.stringify(["because", "although", "but", "when"]), correctAnswer: "but", explanation: "'But' is a coordinating conjunction (one of the FANBOYS). The others are subordinating conjunctions.", order: 1 },
    { topicId: t1_7.id, type: "multiple_choice", difficulty: "beginner", question: "Choose the correct conjunction: 'I studied hard ___ I could pass the exam.'", options: JSON.stringify(["but", "so that", "or", "nor"]), correctAnswer: "so that", explanation: "'So that' is a subordinating conjunction of purpose, meaning 'in order to'.", order: 2 },
    { topicId: t1_7.id, type: "multiple_choice", difficulty: "beginner", question: "Which pair is a correlative conjunction?", options: JSON.stringify(["and...but", "either...or", "when...then", "if...but"]), correctAnswer: "either...or", explanation: "'Either...or' is a correlative conjunction pair used to present two alternatives.", order: 3 },
    { topicId: t1_7.id, type: "fill_in_blank", difficulty: "beginner", question: "She was tired, ___ she kept working.", correctAnswer: "but|yet", explanation: "'But' or 'yet' are coordinating conjunctions that show contrast between being tired and continuing to work.", order: 4 },
    { topicId: t1_7.id, type: "fill_in_blank", difficulty: "beginner", question: "I will go ___ you come with me.", correctAnswer: "if", explanation: "'If' is a subordinating conjunction that introduces a condition.", order: 5 },
    { topicId: t1_7.id, type: "error_correction", difficulty: "beginner", question: "I like both tea or coffee.", correctAnswer: "I like both tea and coffee.", explanation: "The correlative pair is 'both...and', not 'both...or'.", order: 6 },
    { topicId: t1_7.id, type: "error_correction", difficulty: "beginner", question: "Although she was tired but she kept working.", correctAnswer: "Although she was tired, she kept working.", explanation: "Do not use 'but' after 'although'. 'Although' already provides the contrast, so adding 'but' is redundant.", order: 7 },
    { topicId: t1_7.id, type: "sentence_rewrite", difficulty: "beginner", question: "Combine with a conjunction: 'She studied hard. She passed the exam.'", correctAnswer: "She studied hard, so she passed the exam.|She passed the exam because she studied hard.", explanation: "'So' shows result; 'because' shows reason. Both correctly combine these related ideas.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 1.8: Interjections ---
  const t1_8 = await db.grammarTopic.create({
    data: {
      categoryId: cat1.id,
      title: "Interjections",
      slug: "interjections",
      description: "Words that express sudden emotions or reactions",
      level: "beginner",
      order: 8,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t1_8.id,
      content: `# Interjections

An **interjection** is a word or phrase that expresses a sudden emotion or reaction. Interjections are grammatically independent from the rest of the sentence.

## Common Interjections and Their Meanings

### Surprise
- Oh! Wow! What! Really! No way!

### Happiness/Approval
- Yay! Hooray! Great! Wonderful! Yes!

### Pain/Dismay
- Ouch! Ow! Oh no! Alas!

### Disgust/Disapproval
- Ugh! Yuck! Eww! Boo!

### Greeting/Attention
- Hey! Hi! Hello! Psst! Ahem!

### Understanding/Agreement
- Ah! Aha! Oh! I see! Right!

### Hesitation
- Um... Uh... Er... Hmm... Well...

## Punctuation Rules
1. **Strong emotion** → Use an exclamation mark: Wow! That's amazing!
2. **Mild emotion** → Use a comma: Oh, I didn't know that.
3. Interjections can stand alone or be part of a sentence.

## Important Notes
- Interjections are more common in spoken and informal written English.
- In academic or formal writing, avoid interjections.
- Some interjections can function as other parts of speech depending on context.`,
      examples: JSON.stringify([
        "**Wow!** That sunset is beautiful! (surprise/admiration)",
        "**Ouch!** That hurt! (pain)",
        "**Hmm**, I need to think about that. (hesitation)",
        "**Hey!** Come over here! (attention)",
        "**Oh no!** I forgot my keys! (dismay)",
        "**Yay!** We won the game! (happiness)"
      ]),
      tips: "Interjections are the easiest part of speech to identify because they express emotion and are usually followed by an exclamation mark. They do not connect grammatically to the rest of the sentence.",
    },
  });
  for (const ex of [
    { topicId: t1_8.id, type: "multiple_choice", difficulty: "beginner", question: "Which word is an interjection?", options: JSON.stringify(["quickly", "beautiful", "wow", "table"]), correctAnswer: "wow", explanation: "'Wow' is an interjection that expresses surprise or amazement.", order: 1 },
    { topicId: t1_8.id, type: "multiple_choice", difficulty: "beginner", question: "What emotion does 'Ouch!' express?", options: JSON.stringify(["happiness", "pain", "surprise", "hesitation"]), correctAnswer: "pain", explanation: "'Ouch' is an interjection used to express physical pain.", order: 2 },
    { topicId: t1_8.id, type: "multiple_choice", difficulty: "beginner", question: "Which punctuation typically follows a strong interjection?", options: JSON.stringify(["period", "comma", "exclamation mark", "question mark"]), correctAnswer: "exclamation mark", explanation: "Strong interjections expressing strong emotion are followed by an exclamation mark.", order: 3 },
    { topicId: t1_8.id, type: "fill_in_blank", difficulty: "beginner", question: "___! That was a wonderful performance!", correctAnswer: "Wow|Bravo|Amazing", explanation: "An interjection expressing admiration or excitement fits before this positive statement.", order: 4 },
    { topicId: t1_8.id, type: "fill_in_blank", difficulty: "beginner", question: "___! I just stepped on a nail!", correctAnswer: "Ouch|Ow|Ooh", explanation: "An interjection expressing pain fits this context.", order: 5 },
    { topicId: t1_8.id, type: "error_correction", difficulty: "beginner", question: "Wow. That is the most amazing thing I have ever seen.", correctAnswer: "Wow! That is the most amazing thing I have ever seen.", explanation: "'Wow' expresses strong emotion and should be followed by an exclamation mark, not a period.", order: 6 },
    { topicId: t1_8.id, type: "error_correction", difficulty: "beginner", question: "Oh no I forgot to bring my homework.", correctAnswer: "Oh no! I forgot to bring my homework.", explanation: "'Oh no' is an interjection expressing dismay and needs an exclamation mark after it.", order: 7 },
    { topicId: t1_8.id, type: "sentence_rewrite", difficulty: "beginner", question: "Add an appropriate interjection: 'That is great news about your promotion.'", correctAnswer: "Wow! That is great news about your promotion!|Yay! That is great news about your promotion!", explanation: "An interjection of happiness or surprise enhances the excitement of the statement.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 1.9: Articles & Determiners ---
  const t1_9 = await db.grammarTopic.create({
    data: {
      categoryId: cat1.id,
      title: "Articles & Determiners",
      slug: "articles-and-determiners-intro",
      description: "Words that introduce nouns and specify their reference",
      level: "beginner",
      order: 9,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t1_9.id,
      content: `# Articles & Determiners

**Determiners** are words placed before nouns to clarify what the noun refers to. **Articles** (a, an, the) are the most common type of determiner.

## Articles

### Indefinite Articles: A / An
Used before singular countable nouns when the noun is not specific.
- **a** before consonant sounds: a book, a university (sounds like "yoo")
- **an** before vowel sounds: an apple, an hour (the "h" is silent)

### Definite Article: The
Used when the noun is specific or already known.
- **The** book on the table is mine. (specific book)
- **The** sun rises in the east. (unique — there is only one sun)

### Zero Article (No Article)
- Plural countable nouns used in general: **Dogs** are loyal animals.
- Uncountable nouns used in general: **Water** is essential for life.
- Proper nouns (usually): **Istanbul** is beautiful.

## Other Determiners
- **Demonstratives:** this, that, these, those
- **Possessives:** my, your, his, her, its, our, their
- **Quantifiers:** some, any, many, much, few, little, several, every, each, all
- **Numbers:** one, two, three, first, second

## Key Rules
1. Do not use two determiners together: ~~the my book~~ → my book
2. 'A/an' is only for singular countable nouns.
3. 'The' can be used with singular, plural, and uncountable nouns.`,
      examples: JSON.stringify([
        "I saw **a** cat in the garden. (first mention, non-specific)",
        "**The** cat was black and white. (second mention, now specific)",
        "She ate **an** orange for breakfast. (vowel sound)",
        "He goes to **the** gym every day. (specific gym he always goes to)",
        "**Music** makes people happy. (general — no article)",
        "I need **some** water. (quantifier + uncountable noun)"
      ]),
      tips: "Remember: use 'a' or 'an' based on the SOUND, not the letter. 'A university' (sounds like 'yoo') but 'an umbrella' (sounds like 'uh'). 'A European' but 'an hour'.",
    },
  });
  for (const ex of [
    { topicId: t1_9.id, type: "multiple_choice", difficulty: "beginner", question: "Choose the correct article: 'She is ___ honest person.'", options: JSON.stringify(["a", "an", "the", "no article"]), correctAnswer: "an", explanation: "'Honest' starts with a silent 'h', so the vowel sound 'o' comes first. We use 'an' before vowel sounds.", order: 1 },
    { topicId: t1_9.id, type: "multiple_choice", difficulty: "beginner", question: "Which is correct?", options: JSON.stringify(["I need a information.", "I need an information.", "I need the informations.", "I need some information."]), correctAnswer: "I need some information.", explanation: "'Information' is an uncountable noun. It cannot be used with 'a/an' and does not have a plural form. 'Some' is correct.", order: 2 },
    { topicId: t1_9.id, type: "multiple_choice", difficulty: "beginner", question: "Choose the correct article: '___ Nile is the longest river in Africa.'", options: JSON.stringify(["A", "An", "The", "no article"]), correctAnswer: "The", explanation: "We use 'the' with rivers, oceans, and mountain ranges: the Nile, the Pacific, the Alps.", order: 3 },
    { topicId: t1_9.id, type: "fill_in_blank", difficulty: "beginner", question: "He goes to ___ university in London.", correctAnswer: "a", explanation: "'University' starts with a 'yoo' consonant sound, so we use 'a', not 'an'.", order: 4 },
    { topicId: t1_9.id, type: "fill_in_blank", difficulty: "beginner", question: "___ children need love and care.", correctAnswer: "All", explanation: "'All' is a determiner that refers to every member of the group. No article is needed for a general statement about children.", order: 5 },
    { topicId: t1_9.id, type: "error_correction", difficulty: "beginner", question: "She wants to be an university professor.", correctAnswer: "She wants to be a university professor.", explanation: "'University' begins with a consonant sound ('yoo'), so we use 'a', not 'an'.", order: 6 },
    { topicId: t1_9.id, type: "error_correction", difficulty: "beginner", question: "I love the music. It makes me happy.", correctAnswer: "I love music. It makes me happy.", explanation: "When talking about music in general, no article is needed. 'The music' would refer to specific music.", order: 7 },
    { topicId: t1_9.id, type: "sentence_rewrite", difficulty: "beginner", question: "Add articles where needed: 'I saw movie last night. Movie was about astronaut who traveled to moon.'", correctAnswer: "I saw a movie last night. The movie was about an astronaut who traveled to the moon.", explanation: "First mention uses 'a', second mention uses 'the'. 'An astronaut' (vowel sound). 'The moon' (unique object).", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  console.log("  Category 1: Parts of Speech - 9 topics seeded");

  // ============================================================
  // CATEGORY 2: Verb Tenses
  // ============================================================
  const cat2 = await db.grammarCategory.create({
    data: {
      name: "Verb Tenses",
      slug: "verb-tenses",
      description: "Master all English verb tenses from simple to perfect continuous",
      icon: "Clock",
      order: 2,
    },
  });

  // --- Topic 2.1: Present Simple ---
  const t2_1 = await db.grammarTopic.create({
    data: {
      categoryId: cat2.id,
      title: "Present Simple",
      slug: "present-simple",
      description: "Express habits, facts, and routines",
      level: "beginner",
      order: 1,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t2_1.id,
      content: `# Present Simple

The **present simple** tense is used to talk about habits, routines, general truths, and permanent situations.

## Form

### Affirmative
- I/You/We/They + base verb: I **work** every day.
- He/She/It + verb + s/es: She **works** every day.

### Negative
- I/You/We/They + do not (don't) + base verb: I **don't work** on Sundays.
- He/She/It + does not (doesn't) + base verb: She **doesn't work** on Sundays.

### Question
- Do + I/you/we/they + base verb? **Do** you **work** on Saturdays?
- Does + he/she/it + base verb? **Does** she **work** on Saturdays?

## Spelling Rules for Third Person (he/she/it)
- Most verbs: add -s (play → plays, read → reads)
- Verbs ending in -s, -sh, -ch, -x, -o: add -es (watch → watches, go → goes)
- Verbs ending in consonant + y: change y to i, add -es (study → studies, carry → carries)
- Irregular: have → has

## Usage
1. **Habits and routines:** I **brush** my teeth twice a day.
2. **General truths/facts:** Water **boils** at 100 degrees Celsius.
3. **Permanent situations:** She **lives** in Istanbul.
4. **Scheduled events:** The train **leaves** at 9 AM.
5. **Instructions/directions:** You **turn** left at the traffic lights.`,
      examples: JSON.stringify([
        "She **drinks** coffee every morning. (habit)",
        "The Earth **revolves** around the Sun. (fact)",
        "I **don't eat** meat. (negative — permanent situation)",
        "**Does** he **speak** Turkish? (question)",
        "The shop **opens** at 9 AM. (schedule)",
        "They **live** in Ankara. (permanent situation)"
      ]),
      tips: "Remember to add -s or -es for he/she/it. A common mistake is saying 'She work' instead of 'She works'. In questions and negatives with does/doesn't, the main verb returns to base form: 'Does she work?' NOT 'Does she works?'",
    },
  });
  for (const ex of [
    { topicId: t2_1.id, type: "multiple_choice", difficulty: "beginner", question: "Choose the correct form: 'She ___ to school every day.'", options: JSON.stringify(["go", "goes", "going", "gone"]), correctAnswer: "goes", explanation: "With he/she/it in present simple, add -s or -es to the base verb. 'Go' ends in -o, so it becomes 'goes'.", order: 1 },
    { topicId: t2_1.id, type: "multiple_choice", difficulty: "beginner", question: "Which sentence is in present simple?", options: JSON.stringify(["She is reading a book.", "She reads books every week.", "She read a book yesterday.", "She has read three books."]), correctAnswer: "She reads books every week.", explanation: "Present simple uses the base verb (+ s for he/she/it) to express habits and routines.", order: 2 },
    { topicId: t2_1.id, type: "multiple_choice", difficulty: "beginner", question: "Choose the correct negative: 'He ___ like spicy food.'", options: JSON.stringify(["don't", "doesn't", "isn't", "not"]), correctAnswer: "doesn't", explanation: "For he/she/it in present simple negative, use 'doesn't' + base verb.", order: 3 },
    { topicId: t2_1.id, type: "fill_in_blank", difficulty: "beginner", question: "Water ___ at 100 degrees Celsius.", correctAnswer: "boils", explanation: "'Water' is third person singular (it), so we add -s: boils. This is a scientific fact.", order: 4 },
    { topicId: t2_1.id, type: "fill_in_blank", difficulty: "beginner", question: "___ you ___ English? (speak)", correctAnswer: "Do ... speak", explanation: "For questions with you/we/they in present simple, use 'Do + subject + base verb'.", order: 5 },
    { topicId: t2_1.id, type: "error_correction", difficulty: "beginner", question: "She don't like chocolate.", correctAnswer: "She doesn't like chocolate.", explanation: "With he/she/it, use 'doesn't' (not 'don't') in present simple negatives.", order: 6 },
    { topicId: t2_1.id, type: "error_correction", difficulty: "beginner", question: "Does he goes to work by bus?", correctAnswer: "Does he go to work by bus?", explanation: "After 'does', the main verb stays in base form. 'Does he go', not 'Does he goes'.", order: 7 },
    { topicId: t2_1.id, type: "sentence_rewrite", difficulty: "beginner", question: "Make this negative: 'They play football on weekends.'", correctAnswer: "They don't play football on weekends.|They do not play football on weekends.", explanation: "For they/we/you/I, add 'don't' before the base verb to form the negative.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 2.2: Present Continuous ---
  const t2_2 = await db.grammarTopic.create({
    data: {
      categoryId: cat2.id,
      title: "Present Continuous",
      slug: "present-continuous",
      description: "Describe actions happening right now or temporary situations",
      level: "beginner",
      order: 2,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t2_2.id,
      content: `# Present Continuous

The **present continuous** (also called present progressive) describes actions happening right now, temporary situations, and future arrangements.

## Form
**Subject + am/is/are + verb-ing**

### Affirmative
- I **am working**. / She **is working**. / They **are working**.

### Negative
- I **am not working**. / She **is not (isn't) working**. / They **are not (aren't) working**.

### Question
- **Am** I working? / **Is** she working? / **Are** they working?

## Spelling Rules for -ing
- Most verbs: add -ing (play → playing, read → reading)
- Verbs ending in -e: drop -e, add -ing (make → making, write → writing)
- Short verbs (CVC): double last consonant (run → running, sit → sitting, stop → stopping)
- Verbs ending in -ie: change -ie to -y (die → dying, lie → lying)

## Usage
1. **Actions happening now:** She **is reading** a book right now.
2. **Temporary situations:** I **am staying** with my parents this week.
3. **Future arrangements:** We **are meeting** at 6 PM tomorrow.
4. **Changing situations:** The weather **is getting** colder.
5. **Annoying habits (with always):** He **is always forgetting** his keys!

## Stative Verbs (NOT used in continuous)
Some verbs describe states, not actions, and are usually not used in continuous: know, believe, want, need, like, love, hate, prefer, understand, remember, belong, seem, mean.`,
      examples: JSON.stringify([
        "I **am studying** English right now. (happening now)",
        "She **is living** in London this year. (temporary)",
        "They **are flying** to Paris tomorrow. (future plan)",
        "It **is raining** outside. (current weather)",
        "He **is always losing** his phone! (annoying habit)",
        "The population **is growing** rapidly. (changing situation)"
      ]),
      tips: "Do not use present continuous with stative verbs. Say 'I know the answer' NOT 'I am knowing the answer'. Common stative verbs: know, believe, want, need, like, love, understand, prefer, belong.",
    },
  });
  for (const ex of [
    { topicId: t2_2.id, type: "multiple_choice", difficulty: "beginner", question: "Choose the correct form: 'She ___ a letter right now.'", options: JSON.stringify(["writes", "is writing", "wrote", "has written"]), correctAnswer: "is writing", explanation: "Use present continuous (is + verb-ing) for actions happening right now.", order: 1 },
    { topicId: t2_2.id, type: "multiple_choice", difficulty: "beginner", question: "Which sentence is INCORRECT?", options: JSON.stringify(["I am reading a book.", "She is knowing the answer.", "They are playing football.", "He is cooking dinner."]), correctAnswer: "She is knowing the answer.", explanation: "'Know' is a stative verb and is not used in continuous form. Correct: 'She knows the answer.'", order: 2 },
    { topicId: t2_2.id, type: "multiple_choice", difficulty: "beginner", question: "What is the -ing form of 'sit'?", options: JSON.stringify(["siting", "sitting", "sitin", "sittng"]), correctAnswer: "sitting", explanation: "'Sit' is a short CVC verb (consonant-vowel-consonant), so we double the last consonant: sitting.", order: 3 },
    { topicId: t2_2.id, type: "fill_in_blank", difficulty: "beginner", question: "Look! The children ___ in the park. (play)", correctAnswer: "are playing", explanation: "'Look!' indicates something happening right now, so use present continuous: are playing.", order: 4 },
    { topicId: t2_2.id, type: "fill_in_blank", difficulty: "beginner", question: "I ___ to music at the moment. (listen)", correctAnswer: "am listening", explanation: "'At the moment' signals present continuous. Subject 'I' uses 'am' + verb-ing.", order: 5 },
    { topicId: t2_2.id, type: "error_correction", difficulty: "beginner", question: "She is makeing a cake.", correctAnswer: "She is making a cake.", explanation: "When a verb ends in -e, drop the -e before adding -ing: make → making, not makeing.", order: 6 },
    { topicId: t2_2.id, type: "error_correction", difficulty: "beginner", question: "They are runing in the park.", correctAnswer: "They are running in the park.", explanation: "'Run' is a CVC word, so double the final consonant before -ing: running.", order: 7 },
    { topicId: t2_2.id, type: "sentence_rewrite", difficulty: "beginner", question: "Change to present continuous: 'She reads a book.' (right now)", correctAnswer: "She is reading a book right now.|She is reading a book.", explanation: "Present continuous = subject + am/is/are + verb-ing. She + is + reading.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 2.3: Present Perfect ---
  const t2_3 = await db.grammarTopic.create({
    data: {
      categoryId: cat2.id,
      title: "Present Perfect",
      slug: "present-perfect",
      description: "Connect past experiences and actions to the present",
      level: "intermediate",
      order: 3,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t2_3.id,
      content: `# Present Perfect

The **present perfect** tense connects the past to the present. It describes experiences, changes, and actions that have a result in the present.

## Form
**Subject + have/has + past participle**

### Affirmative
- I/You/We/They **have worked**. He/She/It **has worked**.

### Negative
- I **have not (haven't) worked**. She **has not (hasn't) worked**.

### Question
- **Have** you worked? **Has** she worked?

## Usage
1. **Life experiences:** I **have visited** Paris twice. (sometime in my life, time not important)
2. **Recent actions with present results:** She **has lost** her keys. (She still doesn't have them)
3. **Actions that started in the past and continue:** I **have lived** here for five years. (I still live here)
4. **With just, already, yet, ever, never:**
   - I **have just** finished my homework. (very recently)
   - She **has already** left. (sooner than expected)
   - **Have** you eaten **yet**? (by now)
   - **Have** you **ever** been to Japan? (in your whole life)
   - I **have never** seen snow. (not at any time)

## Present Perfect vs Past Simple
- Present Perfect: I **have lost** my keys. (I still can't find them — present relevance)
- Past Simple: I **lost** my keys yesterday. (specific past time)`,
      examples: JSON.stringify([
        "I **have been** to London three times. (life experience)",
        "She **has just finished** her exam. (very recent)",
        "They **have lived** in Istanbul since 2020. (still living there)",
        "**Have** you **ever** eaten sushi? (life experience question)",
        "He **hasn't called** me yet. (expected action not done)",
        "We **have known** each other for ten years. (ongoing situation)"
      ]),
      tips: "Use 'for' with a duration (for three years, for two hours) and 'since' with a starting point (since 2020, since Monday, since I was a child). Never use present perfect with specific past time expressions like 'yesterday' or 'last week'.",
    },
  });
  for (const ex of [
    { topicId: t2_3.id, type: "multiple_choice", difficulty: "intermediate", question: "Choose the correct form: 'I ___ this movie before.'", options: JSON.stringify(["see", "saw", "have seen", "am seeing"]), correctAnswer: "have seen", explanation: "Use present perfect for life experiences when the specific time is not mentioned.", order: 1 },
    { topicId: t2_3.id, type: "multiple_choice", difficulty: "intermediate", question: "Which is correct?", options: JSON.stringify(["I have gone to Paris last year.", "I went to Paris last year.", "I have been to Paris last year.", "I go to Paris last year."]), correctAnswer: "I went to Paris last year.", explanation: "'Last year' is a specific past time. Use past simple, not present perfect, with specific past times.", order: 2 },
    { topicId: t2_3.id, type: "multiple_choice", difficulty: "intermediate", question: "She has lived here ___ 2018.", options: JSON.stringify(["for", "since", "from", "during"]), correctAnswer: "since", explanation: "Use 'since' with a specific starting point (2018). Use 'for' with a duration (for six years).", order: 3 },
    { topicId: t2_3.id, type: "fill_in_blank", difficulty: "intermediate", question: "They ___ already ___ dinner. (eat)", correctAnswer: "have ... eaten", explanation: "Present perfect: have/has + past participle. 'Eat' is irregular: eat → ate → eaten.", order: 4 },
    { topicId: t2_3.id, type: "fill_in_blank", difficulty: "intermediate", question: "I ___ never ___ to Japan. (be)", correctAnswer: "have ... been", explanation: "Present perfect with 'never' for experiences: have + never + past participle. 'Be' → 'been'.", order: 5 },
    { topicId: t2_3.id, type: "error_correction", difficulty: "intermediate", question: "She has went to the store.", correctAnswer: "She has gone to the store.", explanation: "The past participle of 'go' is 'gone', not 'went'. 'Went' is the past simple form.", order: 6 },
    { topicId: t2_3.id, type: "error_correction", difficulty: "intermediate", question: "I have seen that movie yesterday.", correctAnswer: "I saw that movie yesterday.", explanation: "Don't use present perfect with specific past times. 'Yesterday' requires past simple.", order: 7 },
    { topicId: t2_3.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Rewrite using present perfect: 'I started living here in 2019. I still live here.'", correctAnswer: "I have lived here since 2019.", explanation: "Present perfect + since shows an action that started in the past and continues to the present.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 2.4: Present Perfect Continuous ---
  const t2_4 = await db.grammarTopic.create({
    data: {
      categoryId: cat2.id,
      title: "Present Perfect Continuous",
      slug: "present-perfect-continuous",
      description: "Emphasize the duration of actions that started in the past and continue",
      level: "intermediate",
      order: 4,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t2_4.id,
      content: `# Present Perfect Continuous

The **present perfect continuous** (also called present perfect progressive) emphasizes the duration of an action that started in the past and continues to the present, or has recently stopped with visible results.

## Form
**Subject + have/has + been + verb-ing**

### Affirmative
- I **have been working** all day. / She **has been working** all day.

### Negative
- I **haven't been sleeping** well. / He **hasn't been feeling** well.

### Question
- **Have** you **been waiting** long? / **Has** it **been raining**?

## Usage
1. **Duration of ongoing action:** I **have been studying** for three hours. (still studying)
2. **Recently stopped action with visible results:** She **has been crying**. (Her eyes are red.)
3. **Repeated action over a period:** He **has been calling** me all day. (multiple calls)
4. **Temporary ongoing situation:** They **have been living** with us while their house is renovated.

## Present Perfect vs Present Perfect Continuous
- **Present Perfect:** I **have read** three books this month. (focus on completed result)
- **Present Perfect Continuous:** I **have been reading** a book all morning. (focus on the activity and its duration)`,
      examples: JSON.stringify([
        "I **have been waiting** for you for an hour! (duration)",
        "She **has been cooking** since morning. (ongoing activity)",
        "It **has been raining** all day. (duration of weather)",
        "You look tired. **Have** you **been working** hard? (visible result)",
        "They **have been learning** English for two years. (ongoing)",
        "He **has been playing** tennis since he was five. (started in past, continues)"
      ]),
      tips: "Use present perfect continuous to emphasize HOW LONG something has been happening. Use present perfect (without continuous) to emphasize HOW MANY or COMPLETED results. Compare: 'I have been reading' (focus on the activity) vs 'I have read 3 books' (focus on the result).",
    },
  });
  for (const ex of [
    { topicId: t2_4.id, type: "multiple_choice", difficulty: "intermediate", question: "Choose the correct form: 'It ___ all morning.'", options: JSON.stringify(["rains", "is raining", "has been raining", "rained"]), correctAnswer: "has been raining", explanation: "'All morning' emphasizes the duration of an action that started earlier and continues. Use present perfect continuous.", order: 1 },
    { topicId: t2_4.id, type: "multiple_choice", difficulty: "intermediate", question: "Which emphasizes duration? 'She ___ three letters.' vs 'She ___ letters all morning.'", options: JSON.stringify(["has written / has been writing", "has been writing / has written", "wrote / is writing", "writes / has written"]), correctAnswer: "has written / has been writing", explanation: "'Has written three letters' focuses on the result (completed). 'Has been writing letters all morning' focuses on the duration.", order: 2 },
    { topicId: t2_4.id, type: "multiple_choice", difficulty: "intermediate", question: "Your eyes are red. ___ you ___?", options: JSON.stringify(["Did / cry", "Have / been crying", "Are / crying", "Do / cry"]), correctAnswer: "Have / been crying", explanation: "Visible results of a recent activity suggest present perfect continuous.", order: 3 },
    { topicId: t2_4.id, type: "fill_in_blank", difficulty: "intermediate", question: "They ___ ___ ___ here since 2020. (live)", correctAnswer: "have been living", explanation: "Present perfect continuous: have/has + been + verb-ing. 'Since 2020' shows duration from a point in the past.", order: 4 },
    { topicId: t2_4.id, type: "fill_in_blank", difficulty: "intermediate", question: "She ___ ___ ___ English for five years. (study)", correctAnswer: "has been studying", explanation: "With 'for five years' and an ongoing action, use present perfect continuous: has been studying.", order: 5 },
    { topicId: t2_4.id, type: "error_correction", difficulty: "intermediate", question: "I have been knowing him for years.", correctAnswer: "I have known him for years.", explanation: "'Know' is a stative verb and cannot be used in continuous forms. Use present perfect: 'have known'.", order: 6 },
    { topicId: t2_4.id, type: "error_correction", difficulty: "intermediate", question: "She has been written emails all day.", correctAnswer: "She has been writing emails all day.", explanation: "Present perfect continuous uses have/has + been + verb-ING, not the past participle.", order: 7 },
    { topicId: t2_4.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Rewrite to emphasize duration: 'She started reading at 9 AM. She is still reading now.'", correctAnswer: "She has been reading since 9 AM.", explanation: "Present perfect continuous + since emphasizes the ongoing duration of the activity.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 2.5: Past Simple ---
  const t2_5 = await db.grammarTopic.create({
    data: {
      categoryId: cat2.id,
      title: "Past Simple",
      slug: "past-simple",
      description: "Talk about completed actions in the past",
      level: "beginner",
      order: 5,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t2_5.id,
      content: `# Past Simple

The **past simple** tense is used for completed actions at a specific time in the past.

## Form

### Regular Verbs: base verb + -ed
- walk → walked, play → played, study → studied

### Irregular Verbs: unique past forms
- go → went, eat → ate, buy → bought, see → saw, take → took

### Negative: did not (didn't) + base verb
- She **didn't go** to the party.

### Question: Did + subject + base verb?
- **Did** you **see** the movie?

## Spelling Rules for Regular Verbs
- Most verbs: add -ed (played, opened)
- Verbs ending in -e: add -d (liked, moved)
- Verbs ending in consonant + y: change y to i, add -ed (studied, carried)
- Short CVC verbs: double last consonant + -ed (stopped, planned)

## Usage
1. **Completed past actions:** I **visited** my grandmother last weekend.
2. **Past habits:** She **walked** to school every day when she was young.
3. **Past states:** He **was** very happy as a child.
4. **Sequence of past events:** She **woke** up, **brushed** her teeth, and **left** for work.

## Time Expressions
yesterday, last week/month/year, ago, in 2015, when I was young`,
      examples: JSON.stringify([
        "I **went** to the cinema yesterday. (completed action)",
        "She **studied** medicine at university. (past period of life)",
        "They **didn't enjoy** the concert. (negative)",
        "**Did** you **travel** abroad last summer? (question)",
        "He **bought** a new car last month. (irregular verb)",
        "We **lived** in London for five years. (past state, no longer true)"
      ]),
      tips: "Remember: in questions and negatives, 'did/didn't' carries the past tense, so the main verb returns to base form. Say 'Did you go?' NOT 'Did you went?' Say 'She didn't eat' NOT 'She didn't ate'.",
    },
  });
  for (const ex of [
    { topicId: t2_5.id, type: "multiple_choice", difficulty: "beginner", question: "Choose the correct past simple: 'She ___ to Paris last year.'", options: JSON.stringify(["goes", "go", "went", "has gone"]), correctAnswer: "went", explanation: "'Last year' is a specific past time. 'Go' is irregular: go → went.", order: 1 },
    { topicId: t2_5.id, type: "multiple_choice", difficulty: "beginner", question: "Which is the correct negative?", options: JSON.stringify(["She didn't went.", "She didn't go.", "She don't go.", "She not go."]), correctAnswer: "She didn't go.", explanation: "Past simple negative: didn't + base verb. The main verb stays in base form after 'didn't'.", order: 2 },
    { topicId: t2_5.id, type: "multiple_choice", difficulty: "beginner", question: "What is the past tense of 'buy'?", options: JSON.stringify(["buyed", "bought", "buied", "boughted"]), correctAnswer: "bought", explanation: "'Buy' is an irregular verb: buy → bought → bought.", order: 3 },
    { topicId: t2_5.id, type: "fill_in_blank", difficulty: "beginner", question: "They ___ a great time at the party last night.", correctAnswer: "had", explanation: "'Have' in past simple is 'had'. 'Last night' tells us this is past simple.", order: 4 },
    { topicId: t2_5.id, type: "fill_in_blank", difficulty: "beginner", question: "___ you ___ the new restaurant? (try)", correctAnswer: "Did ... try", explanation: "Past simple question: Did + subject + base verb.", order: 5 },
    { topicId: t2_5.id, type: "error_correction", difficulty: "beginner", question: "She readed the book in one day.", correctAnswer: "She read the book in one day.", explanation: "'Read' is an irregular verb. The past tense is 'read' (pronounced 'red'), not 'readed'.", order: 6 },
    { topicId: t2_5.id, type: "error_correction", difficulty: "beginner", question: "Did you went to school yesterday?", correctAnswer: "Did you go to school yesterday?", explanation: "After 'did', the verb must be in base form: 'go', not 'went'.", order: 7 },
    { topicId: t2_5.id, type: "sentence_rewrite", difficulty: "beginner", question: "Change to past simple: 'They eat lunch at noon every day.' (yesterday)", correctAnswer: "They ate lunch at noon yesterday.", explanation: "'Eat' is irregular: eat → ate. Replace 'every day' with 'yesterday' for past time.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 2.6: Past Continuous ---
  const t2_6 = await db.grammarTopic.create({
    data: {
      categoryId: cat2.id,
      title: "Past Continuous",
      slug: "past-continuous",
      description: "Describe actions that were in progress at a specific past time",
      level: "intermediate",
      order: 6,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t2_6.id,
      content: `# Past Continuous

The **past continuous** (past progressive) describes actions that were in progress at a specific moment in the past.

## Form
**Subject + was/were + verb-ing**

### Affirmative
- I/He/She/It **was working**. You/We/They **were working**.

### Negative
- I **wasn't working**. They **weren't working**.

### Question
- **Was** she working? **Were** they working?

## Usage
1. **Action in progress at a specific past time:** At 8 PM, I **was watching** TV.
2. **Background action interrupted by another:** I **was cooking** when the phone **rang**.
3. **Two simultaneous past actions:** She **was reading** while he **was cooking**.
4. **Setting the scene in a story:** The sun **was shining** and the birds **were singing**.
5. **Temporary past situation:** She **was staying** with friends that week.

## Past Simple vs Past Continuous
- **Past continuous:** longer, background action (was cooking)
- **Past simple:** shorter, interrupting action (rang)
- While I **was walking** home, I **met** an old friend.`,
      examples: JSON.stringify([
        "I **was sleeping** when you called. (interrupted action)",
        "At 3 PM yesterday, she **was studying**. (action in progress)",
        "They **were playing** football while we **were watching**. (simultaneous)",
        "It **was raining** when we left the house. (background/scene)",
        "**Were** you **listening** to me? (question)",
        "He **wasn't paying** attention in class. (negative)"
      ]),
      tips: "Use 'when' + past simple for the interrupting action and 'while' + past continuous for the ongoing action. Example: 'While I was walking (ongoing), I saw (interruption) a deer.'",
    },
  });
  for (const ex of [
    { topicId: t2_6.id, type: "multiple_choice", difficulty: "intermediate", question: "Choose: 'She ___ when the phone rang.'", options: JSON.stringify(["cooked", "was cooking", "is cooking", "has cooked"]), correctAnswer: "was cooking", explanation: "Past continuous for the action in progress that was interrupted by the phone ringing (past simple).", order: 1 },
    { topicId: t2_6.id, type: "multiple_choice", difficulty: "intermediate", question: "Which is correct?", options: JSON.stringify(["While I studied, she was cooking.", "While I was studying, she was cooking.", "While I study, she cooked.", "While I am studying, she cooked."]), correctAnswer: "While I was studying, she was cooking.", explanation: "Two simultaneous past actions both use past continuous, connected by 'while'.", order: 2 },
    { topicId: t2_6.id, type: "multiple_choice", difficulty: "intermediate", question: "At 9 PM last night, I ___.", options: JSON.stringify(["sleep", "slept", "was sleeping", "have slept"]), correctAnswer: "was sleeping", explanation: "'At 9 PM last night' specifies a moment when an action was in progress. Use past continuous.", order: 3 },
    { topicId: t2_6.id, type: "fill_in_blank", difficulty: "intermediate", question: "They ___ ___ TV when the lights went out. (watch)", correctAnswer: "were watching", explanation: "Past continuous (were + verb-ing) for the action in progress before the interruption.", order: 4 },
    { topicId: t2_6.id, type: "fill_in_blank", difficulty: "intermediate", question: "While she ___ ___, he was reading a book. (sleep)", correctAnswer: "was sleeping", explanation: "Past continuous for both simultaneous actions. 'She' takes 'was'.", order: 5 },
    { topicId: t2_6.id, type: "error_correction", difficulty: "intermediate", question: "I was walk to school when it started raining.", correctAnswer: "I was walking to school when it started raining.", explanation: "Past continuous requires was/were + verb-ING: 'was walking', not 'was walk'.", order: 6 },
    { topicId: t2_6.id, type: "error_correction", difficulty: "intermediate", question: "She were reading when I arrived.", correctAnswer: "She was reading when I arrived.", explanation: "With she/he/it, use 'was', not 'were'. 'Were' is for you/we/they.", order: 7 },
    { topicId: t2_6.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Combine: 'I was taking a shower. The doorbell rang.'", correctAnswer: "I was taking a shower when the doorbell rang.|While I was taking a shower, the doorbell rang.", explanation: "Use past continuous for the longer action and past simple for the interruption. Connect with 'when' or 'while'.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 2.7: Past Perfect ---
  const t2_7 = await db.grammarTopic.create({
    data: {
      categoryId: cat2.id,
      title: "Past Perfect",
      slug: "past-perfect",
      description: "Talk about actions completed before another past action",
      level: "intermediate",
      order: 7,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t2_7.id,
      content: `# Past Perfect

The **past perfect** describes an action that was completed before another action or time in the past. It is the "past of the past."

## Form
**Subject + had + past participle**

### Affirmative
- I/She/They **had finished** before noon.

### Negative
- I **had not (hadn't) finished** before noon.

### Question
- **Had** you **finished** before noon?

## Usage
1. **Action before another past action:** When I arrived, she **had already left**.
2. **Experience before a past time:** By 2020, he **had visited** ten countries.
3. **Third conditional (past unreal):** If I **had known**, I would have helped.
4. **Reported speech:** She said she **had seen** the movie.

## Key Time Expressions
- before, after, when, by the time, already, just, never, until

## Past Simple vs Past Perfect
- She **ate** lunch and then she **went** out. (chronological order — both past simple is fine)
- When I arrived, she **had already eaten** lunch. (non-chronological — past perfect shows which happened first)`,
      examples: JSON.stringify([
        "By the time we arrived, the movie **had started**. (earlier action)",
        "She **had never flown** before that trip. (experience before a past time)",
        "After he **had finished** his homework, he watched TV. (sequence)",
        "I **hadn't eaten** anything, so I was very hungry. (cause and effect)",
        "They told me they **had already booked** the tickets. (reported speech)",
        "If I **had studied** harder, I would have passed. (third conditional)"
      ]),
      tips: "You only need past perfect when it is important to show that one past action happened BEFORE another. If events are in chronological order, past simple is usually fine: 'I ate breakfast and went to work' (no past perfect needed).",
    },
  });
  for (const ex of [
    { topicId: t2_7.id, type: "multiple_choice", difficulty: "intermediate", question: "When I got home, my family ___ dinner.", options: JSON.stringify(["already ate", "had already eaten", "have already eaten", "already eat"]), correctAnswer: "had already eaten", explanation: "Past perfect shows the eating was completed before the arrival (another past action).", order: 1 },
    { topicId: t2_7.id, type: "multiple_choice", difficulty: "intermediate", question: "She ___ never ___ sushi before she went to Japan.", options: JSON.stringify(["has / tried", "had / tried", "did / try", "was / trying"]), correctAnswer: "had / tried", explanation: "Past perfect for an experience before another past event (going to Japan).", order: 2 },
    { topicId: t2_7.id, type: "multiple_choice", difficulty: "intermediate", question: "By the time the ambulance arrived, the patient ___.", options: JSON.stringify(["died", "has died", "had died", "was dying"]), correctAnswer: "had died", explanation: "'By the time' + past simple signals that another action was already complete — use past perfect.", order: 3 },
    { topicId: t2_7.id, type: "fill_in_blank", difficulty: "intermediate", question: "After she ___ ___ the letter, she posted it. (write)", correctAnswer: "had written", explanation: "Past perfect: had + past participle. 'Write' → 'written'. The writing happened before the posting.", order: 4 },
    { topicId: t2_7.id, type: "fill_in_blank", difficulty: "intermediate", question: "I was hungry because I ___ ___ breakfast. (not eat)", correctAnswer: "hadn't eaten|had not eaten", explanation: "Past perfect negative explains why a past situation existed: hadn't + past participle.", order: 5 },
    { topicId: t2_7.id, type: "error_correction", difficulty: "intermediate", question: "When I arrived, she already left.", correctAnswer: "When I arrived, she had already left.", explanation: "To show that leaving happened before arriving, use past perfect: 'had already left'.", order: 6 },
    { topicId: t2_7.id, type: "error_correction", difficulty: "intermediate", question: "He had went to the store before I called.", correctAnswer: "He had gone to the store before I called.", explanation: "Past perfect uses 'had' + past participle. The past participle of 'go' is 'gone', not 'went'.", order: 7 },
    { topicId: t2_7.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Combine with past perfect: 'She finished her work. Then she went home.'", correctAnswer: "After she had finished her work, she went home.|She went home after she had finished her work.", explanation: "Past perfect for the first action, past simple for the second. 'After' connects the sequence.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 2.8: Past Perfect Continuous ---
  const t2_8 = await db.grammarTopic.create({
    data: {
      categoryId: cat2.id,
      title: "Past Perfect Continuous",
      slug: "past-perfect-continuous",
      description: "Emphasize duration of actions that were ongoing before another past event",
      level: "advanced",
      order: 8,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t2_8.id,
      content: `# Past Perfect Continuous

The **past perfect continuous** emphasizes the duration of an action that was ongoing before another past action or time.

## Form
**Subject + had been + verb-ing**

### Affirmative
- She **had been working** for three hours before she took a break.

### Negative
- He **hadn't been sleeping** well before the exam.

### Question
- **Had** you **been waiting** long when the bus arrived?

## Usage
1. **Duration before a past event:** I **had been studying** for two hours when you called.
2. **Cause of a past situation:** She was tired because she **had been running**.
3. **Ongoing action up to a past point:** They **had been living** there for ten years before they moved.

## Past Perfect vs Past Perfect Continuous
- **Past Perfect:** She **had written** three letters. (focus on completed result)
- **Past Perfect Continuous:** She **had been writing** letters all morning. (focus on the activity and its duration)`,
      examples: JSON.stringify([
        "I **had been waiting** for an hour when the bus finally arrived.",
        "She was out of breath because she **had been running**.",
        "They **had been dating** for two years before they got married.",
        "He **had been working** at the company for ten years before he retired.",
        "It **had been raining** all week, so the roads were flooded.",
        "**Had** you **been studying** long before the exam started?"
      ]),
      tips: "Past perfect continuous is used when you want to emphasize HOW LONG something had been happening before another past event. If you want to emphasize the RESULT or COMPLETION, use past perfect instead.",
    },
  });
  for (const ex of [
    { topicId: t2_8.id, type: "multiple_choice", difficulty: "advanced", question: "She was tired because she ___ all day.", options: JSON.stringify(["worked", "has been working", "had been working", "was working"]), correctAnswer: "had been working", explanation: "Past perfect continuous explains the cause of a past situation, emphasizing the duration.", order: 1 },
    { topicId: t2_8.id, type: "multiple_choice", difficulty: "advanced", question: "They ___ for two hours before the concert started.", options: JSON.stringify(["waited", "have been waiting", "had been waiting", "were waiting"]), correctAnswer: "had been waiting", explanation: "An action with duration (two hours) before another past event (concert started) = past perfect continuous.", order: 2 },
    { topicId: t2_8.id, type: "multiple_choice", difficulty: "advanced", question: "The ground was wet because it ___.", options: JSON.stringify(["rained", "had rained", "had been raining", "was raining"]), correctAnswer: "had been raining", explanation: "Past perfect continuous shows the ongoing nature of rain that caused the wet ground. 'Had rained' is also grammatically possible but emphasizes the duration less.", order: 3 },
    { topicId: t2_8.id, type: "fill_in_blank", difficulty: "advanced", question: "I ___ ___ ___ for the company for five years before I got promoted. (work)", correctAnswer: "had been working", explanation: "Past perfect continuous: had been + verb-ing. Shows the duration of work before the promotion.", order: 4 },
    { topicId: t2_8.id, type: "fill_in_blank", difficulty: "advanced", question: "How long ___ you ___ ___ before the taxi arrived? (wait)", correctAnswer: "had ... been waiting", explanation: "Past perfect continuous question: Had + subject + been + verb-ing.", order: 5 },
    { topicId: t2_8.id, type: "error_correction", difficulty: "advanced", question: "She had been study English for years before she moved to London.", correctAnswer: "She had been studying English for years before she moved to London.", explanation: "Past perfect continuous requires had been + verb-ING: 'studying', not 'study'.", order: 6 },
    { topicId: t2_8.id, type: "error_correction", difficulty: "advanced", question: "They had been knew each other for years.", correctAnswer: "They had known each other for years.", explanation: "'Know' is a stative verb and cannot be used in continuous forms. Use past perfect: 'had known'.", order: 7 },
    { topicId: t2_8.id, type: "sentence_rewrite", difficulty: "advanced", question: "Rewrite emphasizing duration: 'He worked at the company for ten years. Then he retired.'", correctAnswer: "He had been working at the company for ten years before he retired.", explanation: "Past perfect continuous emphasizes the duration of work leading up to the retirement.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 2.9: Future Simple (will) ---
  const t2_9 = await db.grammarTopic.create({
    data: {
      categoryId: cat2.id,
      title: "Future Simple (will)",
      slug: "future-simple-will",
      description: "Make predictions, promises, and spontaneous decisions about the future",
      level: "beginner",
      order: 9,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t2_9.id,
      content: `# Future Simple (will)

The **future simple with 'will'** is used for predictions, promises, spontaneous decisions, and offers.

## Form
**Subject + will + base verb**

### Affirmative
- I **will help** you. / She **will come** tomorrow.
- Contraction: I**'ll** help. She**'ll** come.

### Negative
- I **will not (won't) go**.

### Question
- **Will** you **come** to the party?

## Usage
1. **Predictions (opinions/beliefs):** I think it **will rain** tomorrow.
2. **Spontaneous decisions:** The phone is ringing. I**'ll answer** it.
3. **Promises:** I **will always** love you.
4. **Offers:** I**'ll carry** that bag for you.
5. **Threats/warnings:** If you do that again, I **will tell** your mother.
6. **Facts about the future:** The sun **will rise** at 6:15 AM tomorrow.

## Will vs Going to
- **Will:** spontaneous decisions, predictions based on opinion
- **Going to:** planned decisions, predictions based on evidence`,
      examples: JSON.stringify([
        "I think she **will pass** the exam. (prediction)",
        "Don't worry, I **will help** you. (promise)",
        "It's cold. I**'ll close** the window. (spontaneous decision)",
        "**Will** you **marry** me? (request/question)",
        "He **won't come** to the party. (negative prediction)",
        "The meeting **will start** at 2 PM. (scheduled future fact)"
      ]),
      tips: "Use 'will' for decisions you make at the moment of speaking (spontaneous). Use 'going to' for decisions already made before speaking (planned). Example: 'I'll have the chicken.' (deciding now at the restaurant) vs 'I'm going to visit my mother this weekend.' (already planned).",
    },
  });
  for (const ex of [
    { topicId: t2_9.id, type: "multiple_choice", difficulty: "beginner", question: "Choose: 'I think it ___ tomorrow.'", options: JSON.stringify(["rains", "will rain", "is raining", "rained"]), correctAnswer: "will rain", explanation: "Use 'will' for predictions based on opinion or belief ('I think...').", order: 1 },
    { topicId: t2_9.id, type: "multiple_choice", difficulty: "beginner", question: "The doorbell is ringing. '___' the door.'", options: JSON.stringify(["I open", "I'm going to open", "I'll open", "I opened"]), correctAnswer: "I'll open", explanation: "Use 'will' ('ll) for spontaneous decisions made at the moment of speaking.", order: 2 },
    { topicId: t2_9.id, type: "multiple_choice", difficulty: "beginner", question: "Which expresses a promise?", options: JSON.stringify(["I will be going.", "I will always remember you.", "I will have finished.", "I am going to eat."]), correctAnswer: "I will always remember you.", explanation: "'Will + always' expresses a strong promise about the future.", order: 3 },
    { topicId: t2_9.id, type: "fill_in_blank", difficulty: "beginner", question: "Don't worry. I ___ be there on time.", correctAnswer: "will|'ll", explanation: "'Will' expresses a promise. The contraction 'll is also correct.", order: 4 },
    { topicId: t2_9.id, type: "fill_in_blank", difficulty: "beginner", question: "She ___ come to the meeting. She is too busy.", correctAnswer: "won't|will not", explanation: "Won't (will not) is used for negative predictions or refusals.", order: 5 },
    { topicId: t2_9.id, type: "error_correction", difficulty: "beginner", question: "I will to help you with your homework.", correctAnswer: "I will help you with your homework.", explanation: "After 'will', use the base form of the verb directly, without 'to'.", order: 6 },
    { topicId: t2_9.id, type: "error_correction", difficulty: "beginner", question: "Will you comes to my party?", correctAnswer: "Will you come to my party?", explanation: "After 'will', the verb stays in base form. No -s ending is needed.", order: 7 },
    { topicId: t2_9.id, type: "sentence_rewrite", difficulty: "beginner", question: "Make this a question: 'She will arrive at 6 PM.'", correctAnswer: "Will she arrive at 6 PM?", explanation: "For will-questions, move 'will' before the subject: Will + subject + base verb.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 2.10: Future Going To ---
  const t2_10 = await db.grammarTopic.create({
    data: {
      categoryId: cat2.id,
      title: "Future Going To",
      slug: "future-going-to",
      description: "Express plans and predictions based on evidence",
      level: "beginner",
      order: 10,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t2_10.id,
      content: `# Future Going To

**"Going to"** is used for planned intentions and predictions based on present evidence.

## Form
**Subject + am/is/are + going to + base verb**

### Affirmative
- I **am going to study** tonight. / She **is going to travel** next month.

### Negative
- I **am not going to eat** junk food. / He **isn't going to come**.

### Question
- **Are** you **going to study** tonight?

## Usage
1. **Plans and intentions (already decided):** I **am going to visit** my grandparents this weekend. (decided before now)
2. **Predictions based on evidence:** Look at those clouds! It **is going to rain**. (evidence: clouds)
3. **Intentions/determination:** She **is going to become** a doctor. (strong personal intention)

## Going to vs Will
- **Going to:** I**'m going to buy** a car. (I've already decided, maybe saved money)
- **Will:** I think I**'ll buy** a car someday. (not a firm plan, just a thought)

- **Going to (evidence):** She's feeling dizzy. She**'s going to faint**. (evidence: she looks dizzy)
- **Will (opinion):** I think she**'ll be** fine. (just my opinion, no evidence)`,
      examples: JSON.stringify([
        "I **am going to start** a new job next Monday. (plan)",
        "Look out! The vase **is going to fall**! (evidence-based prediction)",
        "They **are going to move** to a bigger house. (intention)",
        "She **isn't going to accept** the offer. (negative plan)",
        "**Are** you **going to attend** the conference? (question)",
        "We **are going to have** a baby! (announcement of plan)"
      ]),
      tips: "In casual speech, 'going to' is often pronounced 'gonna' — but don't write 'gonna' in formal English. Also, if someone asks 'What are your plans?', use 'going to' in your answer since plans are already decided.",
    },
  });
  for (const ex of [
    { topicId: t2_10.id, type: "multiple_choice", difficulty: "beginner", question: "She has bought a plane ticket. She ___ to Paris.", options: JSON.stringify(["will fly", "is going to fly", "flies", "flew"]), correctAnswer: "is going to fly", explanation: "She already has a ticket — this is a plan made before now. Use 'going to'.", order: 1 },
    { topicId: t2_10.id, type: "multiple_choice", difficulty: "beginner", question: "Look at those dark clouds! It ___.", options: JSON.stringify(["will rain", "rains", "is going to rain", "rained"]), correctAnswer: "is going to rain", explanation: "There is present evidence (dark clouds). Use 'going to' for evidence-based predictions.", order: 2 },
    { topicId: t2_10.id, type: "multiple_choice", difficulty: "beginner", question: "Which shows a pre-made plan?", options: JSON.stringify(["I'll have coffee.", "I'm going to study medicine at university.", "I'll help you.", "She'll probably come."]), correctAnswer: "I'm going to study medicine at university.", explanation: "Studying medicine is a big decision made in advance (a plan), so 'going to' is correct.", order: 3 },
    { topicId: t2_10.id, type: "fill_in_blank", difficulty: "beginner", question: "We ___ ___ ___ visit our grandparents this Sunday. (plan)", correctAnswer: "are going to", explanation: "'Going to' is used for pre-planned future actions. With 'we', use 'are going to'.", order: 4 },
    { topicId: t2_10.id, type: "fill_in_blank", difficulty: "beginner", question: "He ___ ___ ___ apply for the job. He has already written his CV.", correctAnswer: "is going to", explanation: "He has prepared (written CV), showing a plan. Use 'is going to' with he/she/it.", order: 5 },
    { topicId: t2_10.id, type: "error_correction", difficulty: "beginner", question: "She is going to travels to London next week.", correctAnswer: "She is going to travel to London next week.", explanation: "After 'going to', use the base form of the verb: 'travel', not 'travels'.", order: 6 },
    { topicId: t2_10.id, type: "error_correction", difficulty: "beginner", question: "I am go to study tonight.", correctAnswer: "I am going to study tonight.", explanation: "The correct form is 'am/is/are going to + base verb'. 'Going' is required.", order: 7 },
    { topicId: t2_10.id, type: "sentence_rewrite", difficulty: "beginner", question: "Make negative: 'They are going to sell their house.'", correctAnswer: "They are not going to sell their house.|They aren't going to sell their house.", explanation: "Add 'not' after am/is/are: 'are not going to' or 'aren't going to'.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 2.11: Future Continuous ---
  const t2_11 = await db.grammarTopic.create({
    data: {
      categoryId: cat2.id,
      title: "Future Continuous",
      slug: "future-continuous",
      description: "Describe actions that will be in progress at a specific future time",
      level: "intermediate",
      order: 11,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t2_11.id,
      content: `# Future Continuous

The **future continuous** describes actions that will be in progress at a specific time in the future.

## Form
**Subject + will be + verb-ing**

### Affirmative
- I **will be working** at 3 PM tomorrow.

### Negative
- I **won't be working** at that time.

### Question
- **Will** you **be working** at 3 PM?

## Usage
1. **Action in progress at a specific future time:** At 8 PM tonight, I **will be watching** a movie.
2. **Planned future actions (matter-of-fact):** I **will be seeing** John tomorrow. (it's expected/planned)
3. **Polite inquiries:** **Will** you **be using** the car tonight? (softer than 'Are you going to use...')
4. **Parallel future actions:** While I **will be cooking**, she **will be cleaning**.

## Future Simple vs Future Continuous
- **Future Simple:** I **will eat** dinner at 7 PM. (the action will happen)
- **Future Continuous:** At 7 PM, I **will be eating** dinner. (the action will be in progress)`,
      examples: JSON.stringify([
        "This time tomorrow, I **will be flying** to London.",
        "At 10 AM, she **will be taking** an exam.",
        "**Will** you **be attending** the meeting? (polite inquiry)",
        "They **won't be working** on Saturday.",
        "I **will be waiting** for you at the airport.",
        "While you **will be sleeping**, I **will be working** the night shift."
      ]),
      tips: "The future continuous is great for asking polite questions. 'Will you be using the car tonight?' sounds more polite and indirect than 'Are you using the car tonight?' or 'Will you use the car tonight?'",
    },
  });
  for (const ex of [
    { topicId: t2_11.id, type: "multiple_choice", difficulty: "intermediate", question: "At this time tomorrow, I ___ on the beach.", options: JSON.stringify(["lie", "will lie", "will be lying", "am lying"]), correctAnswer: "will be lying", explanation: "'At this time tomorrow' describes a specific future moment when an action will be in progress.", order: 1 },
    { topicId: t2_11.id, type: "multiple_choice", difficulty: "intermediate", question: "Which is a polite inquiry?", options: JSON.stringify(["Do you use the car?", "Will you be using the car?", "Use the car!", "You will use the car."]), correctAnswer: "Will you be using the car?", explanation: "Future continuous makes inquiries sound more polite and less direct.", order: 2 },
    { topicId: t2_11.id, type: "multiple_choice", difficulty: "intermediate", question: "She ___ at the office at 5 PM.", options: JSON.stringify(["will be work", "will be working", "will working", "is be working"]), correctAnswer: "will be working", explanation: "Future continuous: will + be + verb-ing.", order: 3 },
    { topicId: t2_11.id, type: "fill_in_blank", difficulty: "intermediate", question: "This time next week, we ___ ___ ___ on a cruise ship. (relax)", correctAnswer: "will be relaxing", explanation: "'This time next week' signals a specific future moment. Use future continuous: will be + verb-ing.", order: 4 },
    { topicId: t2_11.id, type: "fill_in_blank", difficulty: "intermediate", question: "___ you ___ ___ the office at noon? (use)", correctAnswer: "Will ... be using", explanation: "Future continuous question for a polite inquiry: Will + subject + be + verb-ing.", order: 5 },
    { topicId: t2_11.id, type: "error_correction", difficulty: "intermediate", question: "At 9 PM tonight, I will watching TV.", correctAnswer: "At 9 PM tonight, I will be watching TV.", explanation: "Future continuous requires 'will be + verb-ing'. Don't omit 'be'.", order: 6 },
    { topicId: t2_11.id, type: "error_correction", difficulty: "intermediate", question: "She will be study all evening.", correctAnswer: "She will be studying all evening.", explanation: "After 'will be', use the -ing form: 'studying', not 'study'.", order: 7 },
    { topicId: t2_11.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Rewrite to describe an action in progress: 'I will eat dinner at 7 PM.' (at that specific time)", correctAnswer: "At 7 PM, I will be eating dinner.", explanation: "Future continuous shows the action will be in progress at that specific time.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 2.12: Future Perfect ---
  const t2_12 = await db.grammarTopic.create({
    data: {
      categoryId: cat2.id,
      title: "Future Perfect",
      slug: "future-perfect",
      description: "Talk about actions that will be completed before a specific future time",
      level: "advanced",
      order: 12,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t2_12.id,
      content: `# Future Perfect

The **future perfect** describes actions that will be completed before a specific point in the future.

## Form
**Subject + will have + past participle**

### Affirmative
- By next year, I **will have graduated**.

### Negative
- By 5 PM, she **won't have finished** the report.

### Question
- **Will** you **have completed** the project by Friday?

## Usage
1. **Completion before a future time:** By 2027, I **will have finished** my degree.
2. **Experience by a future time:** By the end of this year, she **will have visited** 20 countries.
3. **Duration up to a future point:** By next month, we **will have lived** here for ten years.

## Key Time Expressions
- by + future time (by tomorrow, by next week, by 2030, by the time)
- before + future event

## Future Simple vs Future Perfect
- **Future Simple:** I **will finish** the book. (at some point in the future)
- **Future Perfect:** I **will have finished** the book by Friday. (completed before Friday)`,
      examples: JSON.stringify([
        "By this time next year, I **will have graduated**.",
        "She **will have left** by the time you arrive.",
        "**Will** you **have finished** the report by 5 PM?",
        "They **won't have arrived** by dinner time.",
        "By 2030, scientists **will have discovered** new treatments.",
        "I **will have been** a teacher for 20 years by next June."
      ]),
      tips: "Look for the word 'by' as a signal for future perfect. 'By' followed by a future time point usually requires future perfect: 'By Friday, I will have finished.' Think of it as a future deadline for completion.",
    },
  });
  for (const ex of [
    { topicId: t2_12.id, type: "multiple_choice", difficulty: "advanced", question: "By next December, she ___ here for five years.", options: JSON.stringify(["works", "will work", "will have worked", "has worked"]), correctAnswer: "will have worked", explanation: "'By next December' is a future deadline. Use future perfect: will have + past participle.", order: 1 },
    { topicId: t2_12.id, type: "multiple_choice", difficulty: "advanced", question: "I ___ the book before the movie comes out.", options: JSON.stringify(["will read", "will have read", "am reading", "have read"]), correctAnswer: "will have read", explanation: "'Before the movie comes out' sets a future deadline for completion. Use future perfect.", order: 2 },
    { topicId: t2_12.id, type: "multiple_choice", difficulty: "advanced", question: "___ they ___ by the time we get there?", options: JSON.stringify(["Will / leave", "Will / have left", "Have / left", "Did / leave"]), correctAnswer: "Will / have left", explanation: "'By the time we get there' is a future reference point. Future perfect question: Will + subject + have + past participle.", order: 3 },
    { topicId: t2_12.id, type: "fill_in_blank", difficulty: "advanced", question: "By the end of this course, you ___ ___ ___ all 12 tenses. (learn)", correctAnswer: "will have learned|will have learnt", explanation: "Future perfect: will have + past participle. Both 'learned' and 'learnt' are acceptable.", order: 4 },
    { topicId: t2_12.id, type: "fill_in_blank", difficulty: "advanced", question: "She ___ ___ ___ dinner by the time we arrive. (cook)", correctAnswer: "will have cooked", explanation: "Future perfect: 'will have cooked' — the cooking will be complete before we arrive.", order: 5 },
    { topicId: t2_12.id, type: "error_correction", difficulty: "advanced", question: "By next month, I will finished the project.", correctAnswer: "By next month, I will have finished the project.", explanation: "Future perfect requires 'will have + past participle', not 'will + past participle'.", order: 6 },
    { topicId: t2_12.id, type: "error_correction", difficulty: "advanced", question: "By 2030, they will have builded a new airport.", correctAnswer: "By 2030, they will have built a new airport.", explanation: "'Build' is an irregular verb: build → built → built. 'Builded' is not correct.", order: 7 },
    { topicId: t2_12.id, type: "sentence_rewrite", difficulty: "advanced", question: "Rewrite using future perfect: 'I plan to read 50 books. The deadline is December.'", correctAnswer: "By December, I will have read 50 books.", explanation: "Future perfect shows completion before a deadline: 'By December' + will have + past participle.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  console.log("  Category 2: Verb Tenses - 12 topics seeded");

  // ============================================================
  // CATEGORY 3: Sentence Structure
  // ============================================================
  const cat3 = await db.grammarCategory.create({
    data: {
      name: "Sentence Structure",
      slug: "sentence-structure",
      description: "Understand how English sentences are built and organized",
      icon: "AlignLeft",
      order: 3,
    },
  });

  // --- Topic 3.1: Subject-Verb Agreement ---
  const t3_1 = await db.grammarTopic.create({
    data: {
      categoryId: cat3.id,
      title: "Subject-Verb Agreement",
      slug: "subject-verb-agreement",
      description: "Ensure subjects and verbs match in number",
      level: "intermediate",
      order: 1,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t3_1.id,
      content: `# Subject-Verb Agreement

A verb must agree with its subject in number. Singular subjects take singular verbs; plural subjects take plural verbs.

## Basic Rules
1. **Singular subject → singular verb:** The dog **runs** fast.
2. **Plural subject → plural verb:** The dogs **run** fast.
3. **Two subjects joined by 'and' → plural:** Tom **and** Jerry **are** friends.
4. **Two subjects joined by 'or/nor' → verb agrees with the nearest:** Neither the teacher **nor** the students **were** ready.

## Tricky Cases
- **Collective nouns** can be singular or plural: The team **is** winning. / The team **are** arguing among themselves.
- **Uncountable nouns** are always singular: The information **is** correct.
- **'There is/are'** depends on the noun after: There **is** a book. There **are** books.
- **'Each/Every/Everyone/Nobody'** takes singular: Everyone **is** here. Each student **has** a book.
- **'Some/All/Most'** depends on the noun: Some water **is** left. Some students **are** absent.
- **Phrases between subject and verb** don't change agreement: The book **on** the shelves **is** mine.`,
      examples: JSON.stringify([
        "The list of items **is** on the desk. (subject = list, singular)",
        "The players on the team **are** talented. (subject = players, plural)",
        "Neither the teacher nor the students **were** prepared.",
        "Everyone **knows** the answer. (everyone = singular)",
        "Mathematics **is** my favorite subject. (academic subjects = singular)",
        "The news **is** shocking. (news = uncountable, singular)"
      ]),
      tips: "The most common trick is when a phrase comes between the subject and verb. Ignore the phrase and find the true subject: 'The box OF CHOCOLATES is (not are) on the table.' The subject is 'box' (singular), not 'chocolates'.",
    },
  });
  for (const ex of [
    { topicId: t3_1.id, type: "multiple_choice", difficulty: "intermediate", question: "The group of students ___ working on the project.", options: JSON.stringify(["are", "is", "were", "have"]), correctAnswer: "is", explanation: "The subject is 'group' (singular), not 'students'. A collective noun with a single unit takes a singular verb.", order: 1 },
    { topicId: t3_1.id, type: "multiple_choice", difficulty: "intermediate", question: "Neither the cat nor the dogs ___ in the yard.", options: JSON.stringify(["is", "are", "was", "has"]), correctAnswer: "are", explanation: "With 'neither...nor', the verb agrees with the nearest subject. 'Dogs' (plural) → 'are'.", order: 2 },
    { topicId: t3_1.id, type: "multiple_choice", difficulty: "intermediate", question: "Everyone ___ to go home early.", options: JSON.stringify(["want", "wants", "are wanting", "have wanted"]), correctAnswer: "wants", explanation: "'Everyone' is always treated as singular: everyone wants, everyone knows, everyone is.", order: 3 },
    { topicId: t3_1.id, type: "fill_in_blank", difficulty: "intermediate", question: "The news ___ very surprising.", correctAnswer: "is|was", explanation: "'News' is uncountable and takes a singular verb despite ending in -s.", order: 4 },
    { topicId: t3_1.id, type: "fill_in_blank", difficulty: "intermediate", question: "There ___ many books on the shelf.", correctAnswer: "are|were", explanation: "'Books' is plural, so 'there are' is correct. The verb agrees with the noun that follows.", order: 5 },
    { topicId: t3_1.id, type: "error_correction", difficulty: "intermediate", question: "The teacher, along with her students, were at the conference.", correctAnswer: "The teacher, along with her students, was at the conference.", explanation: "'Along with' does not make a compound subject. The subject is 'teacher' (singular), so the verb is 'was'.", order: 6 },
    { topicId: t3_1.id, type: "error_correction", difficulty: "intermediate", question: "Each of the students have completed their assignment.", correctAnswer: "Each of the students has completed their assignment.", explanation: "'Each' is always singular: 'Each has', not 'Each have'.", order: 7 },
    { topicId: t3_1.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Correct the agreement: 'The flowers in the vase needs water.'", correctAnswer: "The flowers in the vase need water.", explanation: "The subject is 'flowers' (plural), not 'vase'. Plural subjects take plural verbs: 'need'.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 3.2: Word Order ---
  const t3_2 = await db.grammarTopic.create({
    data: {
      categoryId: cat3.id,
      title: "Word Order",
      slug: "word-order",
      description: "Learn the standard order of words in English sentences",
      level: "beginner",
      order: 2,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t3_2.id,
      content: `# Word Order

English follows a relatively strict word order compared to many other languages. The basic pattern is **Subject + Verb + Object (SVO)**.

## Basic Sentence Patterns
1. **SV:** She **laughed**.
2. **SVO:** She **reads** books.
3. **SVO + Adverb:** She **reads** books **quickly**.
4. **SVOO:** She **gave** him a book. (indirect object + direct object)
5. **SVC:** She **is** happy. (subject + verb + complement)

## Position of Adverbs
- **Frequency adverbs** go before the main verb or after 'be': She **always** arrives on time. She is **always** on time.
- **Manner, place, time** (MPT order): She sang **beautifully** (manner) **at the concert** (place) **last night** (time).

## Position of Adjectives
- Before the noun: a **beautiful** house
- After linking verbs: The house is **beautiful**.

## Inversion (Subject-Verb reversal)
- Questions: **Are** you happy?
- After negative adverbs: Never **have** I seen such beauty.
- After 'here/there': Here **comes** the bus.`,
      examples: JSON.stringify([
        "She **reads** books every evening. (SVO + time)",
        "I **gave** her a present. (SVOO)",
        "They played **happily** in the park yesterday. (manner-place-time)",
        "She **always** eats breakfast. (frequency adverb before verb)",
        "He is **never** late. (frequency adverb after 'be')",
        "**Never have** I seen such a beautiful sunset. (inversion)"
      ]),
      tips: "For the order of information at the end of a sentence, remember MPT: Manner (how), Place (where), Time (when). 'She danced beautifully (M) at the theater (P) last night (T).'",
    },
  });
  for (const ex of [
    { topicId: t3_2.id, type: "multiple_choice", difficulty: "beginner", question: "Which sentence has correct word order?", options: JSON.stringify(["Reads she books every day.", "She reads books every day.", "She books reads every day.", "Every day reads she books."]), correctAnswer: "She reads books every day.", explanation: "English follows SVO order: Subject (She) + Verb (reads) + Object (books) + Time (every day).", order: 1 },
    { topicId: t3_2.id, type: "multiple_choice", difficulty: "beginner", question: "Where does the adverb 'always' go?", options: JSON.stringify(["She eats always breakfast.", "She always eats breakfast.", "Always she eats breakfast.", "She eats breakfast always."]), correctAnswer: "She always eats breakfast.", explanation: "Frequency adverbs go before the main verb: subject + adverb + verb.", order: 2 },
    { topicId: t3_2.id, type: "multiple_choice", difficulty: "beginner", question: "Which order is correct for end-position adverbs?", options: JSON.stringify(["time-place-manner", "manner-place-time", "place-time-manner", "manner-time-place"]), correctAnswer: "manner-place-time", explanation: "The standard order is MPT: Manner (how), Place (where), Time (when).", order: 3 },
    { topicId: t3_2.id, type: "fill_in_blank", difficulty: "beginner", question: "Put in order: quietly / the library / she / studied / in / yesterday. → She ___.", correctAnswer: "studied quietly in the library yesterday", explanation: "SVO + MPT: verb (studied) + manner (quietly) + place (in the library) + time (yesterday).", order: 4 },
    { topicId: t3_2.id, type: "fill_in_blank", difficulty: "beginner", question: "He is ___ late for work. (never)", correctAnswer: "never", explanation: "Frequency adverbs go after the verb 'be': He is never late.", order: 5 },
    { topicId: t3_2.id, type: "error_correction", difficulty: "beginner", question: "She gave to him a present.", correctAnswer: "She gave him a present.", explanation: "With two objects (indirect + direct), the indirect object comes right after the verb without 'to': gave him (IO) a present (DO).", order: 6 },
    { topicId: t3_2.id, type: "error_correction", difficulty: "beginner", question: "I yesterday went to the store.", correctAnswer: "I went to the store yesterday.|Yesterday I went to the store.", explanation: "Time expressions usually go at the end or beginning of a sentence, not between subject and verb.", order: 7 },
    { topicId: t3_2.id, type: "sentence_rewrite", difficulty: "beginner", question: "Put in correct order: 'played / children / the / happily / park / the / in'", correctAnswer: "The children played happily in the park.", explanation: "Subject (The children) + Verb (played) + Manner (happily) + Place (in the park).", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 3.3: Yes/No Questions ---
  const t3_3 = await db.grammarTopic.create({
    data: {
      categoryId: cat3.id,
      title: "Yes/No Questions",
      slug: "yes-no-questions",
      description: "Form questions that can be answered with yes or no",
      level: "beginner",
      order: 3,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t3_3.id,
      content: `# Yes/No Questions

Yes/No questions are questions that can be answered with "yes" or "no." They are formed by placing an auxiliary verb before the subject.

## Formation Rules

### With 'be' as main verb
Move 'be' before the subject:
- She **is** happy. → **Is** she happy?
- They **were** at home. → **Were** they at home?

### With auxiliary/modal verbs
Move the auxiliary before the subject:
- She **can** swim. → **Can** she swim?
- They **have** finished. → **Have** they finished?
- He **will** come. → **Will** he come?

### With main verbs (no auxiliary)
Add do/does (present) or did (past) before the subject:
- You **like** coffee. → **Do** you like coffee?
- She **plays** tennis. → **Does** she play tennis?
- They **went** home. → **Did** they go home?

## Short Answers
- Yes, I **do**. / No, I **don't**.
- Yes, she **is**. / No, she **isn't**.
- Yes, we **can**. / No, we **can't**.
- Yes, he **has**. / No, he **hasn't**.

## Important
After do/does/did, the main verb returns to base form:
- Does she **play** (not plays)? Did they **go** (not went)?`,
      examples: JSON.stringify([
        "**Is** she a teacher? Yes, she **is**.",
        "**Do** you like pizza? No, I **don't**.",
        "**Does** he speak French? Yes, he **does**.",
        "**Did** they finish the project? No, they **didn't**.",
        "**Can** you help me? Yes, I **can**.",
        "**Have** you ever been to Japan? No, I **haven't**."
      ]),
      tips: "The key to forming yes/no questions is finding the auxiliary verb. If there is no auxiliary (simple present or past), you must add do/does/did. Remember: 'Do you like...?' (not 'Like you...?').",
    },
  });
  for (const ex of [
    { topicId: t3_3.id, type: "multiple_choice", difficulty: "beginner", question: "Form a yes/no question: 'She speaks Spanish.'", options: JSON.stringify(["Speaks she Spanish?", "Does she speaks Spanish?", "Does she speak Spanish?", "Do she speak Spanish?"]), correctAnswer: "Does she speak Spanish?", explanation: "Use 'does' for he/she/it in present simple questions. The main verb returns to base form: 'speak', not 'speaks'.", order: 1 },
    { topicId: t3_3.id, type: "multiple_choice", difficulty: "beginner", question: "What is the correct short answer? 'Can you swim?' 'Yes, ___.'", options: JSON.stringify(["I do", "I can", "I am", "I have"]), correctAnswer: "I can", explanation: "Short answers repeat the auxiliary from the question: Can → Yes, I can.", order: 2 },
    { topicId: t3_3.id, type: "multiple_choice", difficulty: "beginner", question: "Form a question: 'They have finished.'", options: JSON.stringify(["Do they have finished?", "Have they finished?", "Did they have finished?", "They have finished?"]), correctAnswer: "Have they finished?", explanation: "When 'have' is an auxiliary (present perfect), move it before the subject.", order: 3 },
    { topicId: t3_3.id, type: "fill_in_blank", difficulty: "beginner", question: "___ you go to the party last night?", correctAnswer: "Did", explanation: "'Last night' is past tense. Use 'Did' to form past simple yes/no questions.", order: 4 },
    { topicId: t3_3.id, type: "fill_in_blank", difficulty: "beginner", question: "___ she working right now? Yes, she ___.", correctAnswer: "Is ... is", explanation: "Present continuous question: Is + subject + verb-ing? Short answer repeats 'is'.", order: 5 },
    { topicId: t3_3.id, type: "error_correction", difficulty: "beginner", question: "Does he likes chocolate?", correctAnswer: "Does he like chocolate?", explanation: "After 'does', the main verb stays in base form: 'like', not 'likes'.", order: 6 },
    { topicId: t3_3.id, type: "error_correction", difficulty: "beginner", question: "Did you went to school yesterday?", correctAnswer: "Did you go to school yesterday?", explanation: "After 'did', the main verb must be in base form: 'go', not 'went'.", order: 7 },
    { topicId: t3_3.id, type: "sentence_rewrite", difficulty: "beginner", question: "Make a yes/no question: 'They are studying for the exam.'", correctAnswer: "Are they studying for the exam?", explanation: "Move 'are' before the subject to form a yes/no question.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 3.4: WH-Questions ---
  const t3_4 = await db.grammarTopic.create({
    data: {
      categoryId: cat3.id,
      title: "WH-Questions",
      slug: "wh-questions",
      description: "Ask open-ended questions with who, what, where, when, why, and how",
      level: "beginner",
      order: 4,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t3_4.id,
      content: `# WH-Questions

WH-questions (also called information questions) begin with a question word and require more than a yes/no answer.

## Question Words
- **Who** — person (subject/object): Who called you?
- **What** — thing/action: What did you buy?
- **Where** — place: Where do you live?
- **When** — time: When did you arrive?
- **Why** — reason: Why are you late?
- **How** — manner/way: How do you get to work?
- **Which** — choice: Which color do you prefer?
- **Whose** — possession: Whose book is this?

## Formation
**WH-word + auxiliary + subject + main verb?**
- **Where** do you live?
- **What** is she doing?
- **When** did they arrive?

## Subject Questions (no auxiliary needed)
When the WH-word IS the subject, do not use do/does/did:
- **Who** called you? (Who = subject → no 'did')
- Compare: **Who** did you call? (Who = object → use 'did')

## How + Adjective/Adverb
- **How old** are you?
- **How much** does it cost?
- **How many** books do you have?
- **How often** do you exercise?
- **How long** have you been waiting?`,
      examples: JSON.stringify([
        "**What** do you do for a living? (asking about occupation)",
        "**Where** did she go yesterday? (asking about place)",
        "**Why** are you crying? (asking about reason)",
        "**Who** wrote this book? (subject question — no auxiliary)",
        "**How long** have you lived here? (asking about duration)",
        "**Whose** car is parked outside? (asking about ownership)"
      ]),
      tips: "Subject questions vs object questions: 'Who broke the window?' (who = subject, no 'did' needed). 'Who did you invite?' (who = object, 'did' is needed). If the question word replaces the subject, don't add an auxiliary.",
    },
  });
  for (const ex of [
    { topicId: t3_4.id, type: "multiple_choice", difficulty: "beginner", question: "Which question asks about a reason?", options: JSON.stringify(["Where do you live?", "Why are you late?", "When did you come?", "Who is she?"]), correctAnswer: "Why are you late?", explanation: "'Why' asks about reasons or causes.", order: 1 },
    { topicId: t3_4.id, type: "multiple_choice", difficulty: "beginner", question: "Choose the correct question: '___ did you buy at the store?'", options: JSON.stringify(["Who", "Where", "What", "When"]), correctAnswer: "What", explanation: "'What' asks about things. You buy things at the store.", order: 2 },
    { topicId: t3_4.id, type: "multiple_choice", difficulty: "beginner", question: "Which is a subject question?", options: JSON.stringify(["Who did you see?", "Who saw you?", "Who do you like?", "Who did she call?"]), correctAnswer: "Who saw you?", explanation: "'Who saw you?' — 'Who' is the subject (the person who did the seeing). No auxiliary 'did' is needed.", order: 3 },
    { topicId: t3_4.id, type: "fill_in_blank", difficulty: "beginner", question: "___ do you go to the gym? Three times a week.", correctAnswer: "How often", explanation: "'How often' asks about frequency. The answer 'three times a week' describes frequency.", order: 4 },
    { topicId: t3_4.id, type: "fill_in_blank", difficulty: "beginner", question: "___ bag is this? It's mine.", correctAnswer: "Whose", explanation: "'Whose' asks about possession/ownership.", order: 5 },
    { topicId: t3_4.id, type: "error_correction", difficulty: "beginner", question: "Where you do live?", correctAnswer: "Where do you live?", explanation: "In WH-questions, the auxiliary comes before the subject: WH-word + auxiliary + subject + verb.", order: 6 },
    { topicId: t3_4.id, type: "error_correction", difficulty: "beginner", question: "Who did call you last night?", correctAnswer: "Who called you last night?", explanation: "This is a subject question (Who = subject). Subject questions don't need 'did'.", order: 7 },
    { topicId: t3_4.id, type: "sentence_rewrite", difficulty: "beginner", question: "Write a question for the underlined answer: 'She lives in Istanbul.'", correctAnswer: "Where does she live?", explanation: "'Istanbul' is a place, so use 'Where'. Present simple with 'she': Where + does + she + base verb.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 3.5: Negatives ---
  const t3_5 = await db.grammarTopic.create({
    data: {
      categoryId: cat3.id,
      title: "Negatives",
      slug: "negatives",
      description: "Form negative sentences correctly in English",
      level: "beginner",
      order: 5,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t3_5.id,
      content: `# Negatives

Negative sentences express that something is not true or does not happen.

## Forming Negatives

### With 'be'
Add 'not' after 'be':
- She **is not (isn't)** happy.
- They **were not (weren't)** home.

### With auxiliary/modal verbs
Add 'not' after the auxiliary:
- She **cannot (can't)** swim.
- They **have not (haven't)** finished.
- He **will not (won't)** come.

### With main verbs (no auxiliary)
Add do not/does not/did not + base verb:
- I **do not (don't) like** spinach.
- She **does not (doesn't) eat** meat.
- They **did not (didn't) go** to the party.

## Negative Words
- **no:** There is **no** milk.
- **nothing:** I saw **nothing**.
- **nobody/no one:** **Nobody** came.
- **nowhere:** There is **nowhere** to sit.
- **never:** I **never** eat junk food.
- **neither...nor:** **Neither** Tom **nor** Jerry came.

## Double Negatives (AVOID in standard English)
- INCORRECT: I don't know nothing.
- CORRECT: I don't know anything. / I know nothing.`,
      examples: JSON.stringify([
        "She **doesn't** speak French. (present simple negative)",
        "They **didn't** enjoy the movie. (past simple negative)",
        "I **haven't** seen him today. (present perfect negative)",
        "**Nobody** answered the phone. (negative word)",
        "There is **nothing** in the fridge. (negative word)",
        "He will **never** forget this day. (negative adverb)"
      ]),
      tips: "In English, use only ONE negative per clause. Don't say 'I don't have no money' (double negative). Say either 'I don't have any money' or 'I have no money.' Double negatives actually create a positive meaning in formal logic!",
    },
  });
  for (const ex of [
    { topicId: t3_5.id, type: "multiple_choice", difficulty: "beginner", question: "Choose the correct negative: 'She ___ like coffee.'", options: JSON.stringify(["don't", "doesn't", "isn't", "not"]), correctAnswer: "doesn't", explanation: "With she/he/it in present simple, use 'doesn't' + base verb.", order: 1 },
    { topicId: t3_5.id, type: "multiple_choice", difficulty: "beginner", question: "Which sentence avoids a double negative?", options: JSON.stringify(["I don't know nothing.", "I don't know anything.", "I don't never go.", "She can't find nobody."]), correctAnswer: "I don't know anything.", explanation: "In standard English, use only one negative: 'don't know anything' or 'know nothing', not both.", order: 2 },
    { topicId: t3_5.id, type: "multiple_choice", difficulty: "beginner", question: "Make negative: 'He can swim.'", options: JSON.stringify(["He can not swim.", "He can't swim.", "He doesn't can swim.", "Both A and B"]), correctAnswer: "Both A and B", explanation: "Both 'cannot' (one word) / 'can not' and 'can't' are correct negative forms of 'can'.", order: 3 },
    { topicId: t3_5.id, type: "fill_in_blank", difficulty: "beginner", question: "There is ___ left in the box. It's empty.", correctAnswer: "nothing", explanation: "'Nothing' means 'not anything'. The box is empty, so nothing is left.", order: 4 },
    { topicId: t3_5.id, type: "fill_in_blank", difficulty: "beginner", question: "She ___ ___ been to Paris. (never)", correctAnswer: "has never", explanation: "'Never' goes between the auxiliary (has) and the past participle: has never been.", order: 5 },
    { topicId: t3_5.id, type: "error_correction", difficulty: "beginner", question: "I don't have no friends.", correctAnswer: "I don't have any friends.", explanation: "Avoid double negatives. Use 'any' with 'don't': 'I don't have any friends' or 'I have no friends'.", order: 6 },
    { topicId: t3_5.id, type: "error_correction", difficulty: "beginner", question: "She doesn't likes chocolate.", correctAnswer: "She doesn't like chocolate.", explanation: "After 'doesn't', the main verb stays in base form: 'like', not 'likes'.", order: 7 },
    { topicId: t3_5.id, type: "sentence_rewrite", difficulty: "beginner", question: "Make negative: 'They have already finished their homework.'", correctAnswer: "They haven't finished their homework yet.|They have not finished their homework yet.", explanation: "In negative present perfect, 'already' changes to 'yet' (at the end): haven't + past participle + yet.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 3.6: Imperatives ---
  const t3_6 = await db.grammarTopic.create({
    data: {
      categoryId: cat3.id,
      title: "Imperatives",
      slug: "imperatives",
      description: "Give commands, instructions, and requests",
      level: "beginner",
      order: 6,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t3_6.id,
      content: `# Imperatives

**Imperative sentences** give commands, instructions, advice, or requests. They use the base form of the verb and usually have no visible subject (the subject "you" is implied).

## Form
**Base verb + ...**

### Affirmative
- **Open** the door.
- **Sit** down, please.
- **Be** careful!

### Negative
- **Don't** + base verb
- **Don't open** the door.
- **Don't be** late!

### Polite Imperatives
- **Please** sit down. / Sit down, **please**.

## Uses
1. **Commands:** **Stop** talking!
2. **Instructions:** **Turn** left at the corner. **Mix** the ingredients well.
3. **Advice:** **Get** some rest. **Don't worry** about it.
4. **Requests:** **Please pass** the salt.
5. **Warnings:** **Watch** out! **Don't touch** that!
6. **Invitations:** **Come** in! **Have** a seat!
7. **Offers:** **Have** some cake.

## Let's (suggestions)
- **Let's go** to the park. (suggestion for us)
- **Let's not argue** about this.

## Important Notes
- Imperatives can sound rude without 'please' or a polite tone.
- Adding 'please' makes imperatives more polite.`,
      examples: JSON.stringify([
        "**Close** the window, please. (polite request)",
        "**Don't** run in the hallway! (negative command)",
        "**Be** quiet during the exam. (command with 'be')",
        "**Let's** go for a walk. (suggestion)",
        "**Turn** right at the traffic light. (instruction)",
        "**Help** yourself to some food. (offer)"
      ]),
      tips: "Imperatives are the simplest sentence form — just use the base verb! No subject is needed because 'you' is always implied. To soften commands, add 'please', use 'could you...?', or add a tag question: 'Sit down, will you?'",
    },
  });
  for (const ex of [
    { topicId: t3_6.id, type: "multiple_choice", difficulty: "beginner", question: "Which is an imperative sentence?", options: JSON.stringify(["She opens the door.", "The door is open.", "Open the door.", "Can you open the door?"]), correctAnswer: "Open the door.", explanation: "An imperative starts with the base verb and has no visible subject. 'Open the door.' is a command.", order: 1 },
    { topicId: t3_6.id, type: "multiple_choice", difficulty: "beginner", question: "How do you form a negative imperative?", options: JSON.stringify(["Not go!", "Don't go!", "No go!", "Doesn't go!"]), correctAnswer: "Don't go!", explanation: "Negative imperatives use 'Don't' + base verb: Don't go, Don't worry, Don't be late.", order: 2 },
    { topicId: t3_6.id, type: "multiple_choice", difficulty: "beginner", question: "Which expresses a suggestion for a group?", options: JSON.stringify(["Go to the park.", "Let's go to the park.", "You go to the park.", "Going to the park."]), correctAnswer: "Let's go to the park.", explanation: "'Let's' + base verb makes a suggestion that includes the speaker.", order: 3 },
    { topicId: t3_6.id, type: "fill_in_blank", difficulty: "beginner", question: "___ be late for class!", correctAnswer: "Don't", explanation: "Negative imperative: Don't + base verb. 'Don't be late!'", order: 4 },
    { topicId: t3_6.id, type: "fill_in_blank", difficulty: "beginner", question: "___ have dinner together tonight.", correctAnswer: "Let's", explanation: "'Let's' is used to make a suggestion for a group including yourself.", order: 5 },
    { topicId: t3_6.id, type: "error_correction", difficulty: "beginner", question: "Please to sit down.", correctAnswer: "Please sit down.", explanation: "Imperatives use the base form directly. Don't add 'to' after 'please'.", order: 6 },
    { topicId: t3_6.id, type: "error_correction", difficulty: "beginner", question: "Don't to worry about the exam.", correctAnswer: "Don't worry about the exam.", explanation: "After 'Don't', use the base verb directly without 'to'.", order: 7 },
    { topicId: t3_6.id, type: "sentence_rewrite", difficulty: "beginner", question: "Make an imperative: 'You should study harder.'", correctAnswer: "Study harder!|Study harder.", explanation: "Remove the subject 'You' and 'should', and use the base verb to form an imperative.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  console.log("  Category 3: Sentence Structure - 6 topics seeded");

  // ============================================================
  // CATEGORY 4: Clauses & Sentences
  // ============================================================
  const cat4 = await db.grammarCategory.create({
    data: {
      name: "Clauses & Sentences",
      slug: "clauses-and-sentences",
      description: "Understand how clauses combine to form complex sentences",
      icon: "Layers",
      order: 4,
    },
  });

  // --- Topic 4.1: Independent & Dependent Clauses ---
  const t4_1 = await db.grammarTopic.create({
    data: {
      categoryId: cat4.id,
      title: "Independent & Dependent Clauses",
      slug: "independent-dependent-clauses",
      description: "Understand the building blocks of complex sentences",
      level: "intermediate",
      order: 1,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t4_1.id,
      content: `# Independent & Dependent Clauses

A **clause** is a group of words that contains a subject and a verb.

## Independent Clauses
An independent clause expresses a complete thought and can stand alone as a sentence.
- **She likes coffee.**
- **The train arrived on time.**

## Dependent (Subordinate) Clauses
A dependent clause has a subject and verb but cannot stand alone. It needs an independent clause to complete its meaning.
- **because she was tired** (incomplete — what happened?)
- **when the rain stopped** (incomplete — then what?)

## Combining Clauses
1. **Two independent clauses** → use coordinating conjunction (FANBOYS) or semicolon:
   - She likes coffee, **and** he likes tea.
   - She likes coffee**;** he likes tea.

2. **Independent + dependent** → use subordinating conjunction:
   - She went home **because she was tired**.
   - **When the rain stopped**, they went outside.

## Recognizing Dependent Clauses
Dependent clauses often begin with:
- Subordinating conjunctions: because, when, if, although, while, since, before, after, unless, until
- Relative pronouns: who, which, that, whose, whom`,
      examples: JSON.stringify([
        "**She studied hard** because **she wanted to pass**. (independent + dependent)",
        "**Although it was cold**, **we went for a walk**. (dependent + independent)",
        "**I stayed home**, and **she went to the store**. (two independent clauses)",
        "The man **who lives next door** is a doctor. (dependent clause inside independent)",
        "**If you study hard**, **you will pass**. (dependent + independent)",
        "**We left early** because **there was a lot of traffic**."
      ]),
      tips: "A quick test: Can the clause stand alone and make sense? If yes, it's independent. If it leaves you asking 'What happened?' or 'So what?', it's dependent. For example, 'Because it was raining' — what happened? It needs more information.",
    },
  });
  for (const ex of [
    { topicId: t4_1.id, type: "multiple_choice", difficulty: "intermediate", question: "Which is an independent clause?", options: JSON.stringify(["Because she was tired.", "When the bus arrived.", "She went to bed early.", "Although it rained."]), correctAnswer: "She went to bed early.", explanation: "'She went to bed early' expresses a complete thought and can stand alone as a sentence.", order: 1 },
    { topicId: t4_1.id, type: "multiple_choice", difficulty: "intermediate", question: "Which word makes a clause dependent?", options: JSON.stringify(["and", "but", "because", "so"]), correctAnswer: "because", explanation: "'Because' is a subordinating conjunction that makes a clause dependent (it needs more information).", order: 2 },
    { topicId: t4_1.id, type: "multiple_choice", difficulty: "intermediate", question: "How many clauses are in: 'She studied because she wanted to pass the exam.'?", options: JSON.stringify(["1", "2", "3", "4"]), correctAnswer: "2", explanation: "Clause 1: 'She studied' (independent). Clause 2: 'because she wanted to pass the exam' (dependent).", order: 3 },
    { topicId: t4_1.id, type: "fill_in_blank", difficulty: "intermediate", question: "I will go to the park ___ it stops raining.", correctAnswer: "when|if|after", explanation: "A subordinating conjunction like 'when', 'if', or 'after' connects the dependent clause to the independent clause.", order: 4 },
    { topicId: t4_1.id, type: "fill_in_blank", difficulty: "intermediate", question: "___ she was tired, she finished the project.", correctAnswer: "Although|Even though|Though", explanation: "A subordinating conjunction of contrast introduces the dependent clause.", order: 5 },
    { topicId: t4_1.id, type: "error_correction", difficulty: "intermediate", question: "Because she was tired. She went to bed.", correctAnswer: "Because she was tired, she went to bed.", explanation: "A dependent clause cannot stand alone as a sentence. It must be attached to an independent clause.", order: 6 },
    { topicId: t4_1.id, type: "error_correction", difficulty: "intermediate", question: "I went to the store, I bought some milk.", correctAnswer: "I went to the store, and I bought some milk.", explanation: "Two independent clauses need a conjunction or semicolon. Without one, it's a comma splice (run-on sentence).", order: 7 },
    { topicId: t4_1.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Combine: 'It was raining. We stayed home.'", correctAnswer: "Because it was raining, we stayed home.|We stayed home because it was raining.", explanation: "Use 'because' to create a dependent clause showing the reason.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 4.2: Relative Clauses ---
  const t4_2 = await db.grammarTopic.create({
    data: {
      categoryId: cat4.id,
      title: "Relative Clauses",
      slug: "relative-clauses",
      description: "Add information about nouns using who, which, that, and whose",
      level: "intermediate",
      order: 2,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t4_2.id,
      content: `# Relative Clauses

A **relative clause** gives extra information about a noun. It usually begins with a relative pronoun: who, which, that, whose, whom, where, when.

## Relative Pronouns
- **who/that** — for people: The woman **who lives next door** is a doctor.
- **which/that** — for things: The book **which I bought** is interesting.
- **whose** — for possession: The man **whose car was stolen** called the police.
- **where** — for places: The restaurant **where we ate** was expensive.
- **when** — for times: I remember the day **when we first met**.

## Defining vs Non-Defining Relative Clauses

### Defining (Essential)
Gives essential information. Without it, the meaning changes. No commas.
- The students **who study hard** pass the exam. (Which students? The ones who study hard.)

### Non-Defining (Extra Information)
Gives extra, non-essential information. Uses commas. Cannot use 'that'.
- My brother**, who lives in London,** is a doctor. (Extra info about my brother.)

## Omitting the Relative Pronoun
In defining clauses, you can omit the relative pronoun when it is the OBJECT:
- The book **(that/which)** I bought is interesting. (I = subject, that = object → can omit)
- The woman **who** teaches us is kind. (who = subject → cannot omit)`,
      examples: JSON.stringify([
        "The teacher **who taught me English** was excellent. (defining)",
        "My sister**, who is 25 years old,** works in marketing. (non-defining)",
        "The movie **that we watched** was boring. (defining, object — 'that' optional)",
        "The house **where I grew up** has been sold. (place)",
        "The boy **whose father is a pilot** wants to fly planes. (possession)",
        "I remember the summer **when we went to Italy**. (time)"
      ]),
      tips: "If you can remove the clause and the sentence still makes sense and identifies the noun, it's non-defining (use commas). If removing it makes the sentence unclear, it's defining (no commas). Never use 'that' in non-defining clauses.",
    },
  });
  for (const ex of [
    { topicId: t4_2.id, type: "multiple_choice", difficulty: "intermediate", question: "Choose: 'The man ___ lives next door is friendly.'", options: JSON.stringify(["which", "who", "whose", "where"]), correctAnswer: "who", explanation: "'Who' is used for people as the subject of the relative clause.", order: 1 },
    { topicId: t4_2.id, type: "multiple_choice", difficulty: "intermediate", question: "Which uses a non-defining relative clause correctly?", options: JSON.stringify(["The book which I bought is good.", "My mother, who is a teacher, loves reading.", "The students that study hard pass.", "People who exercise are healthier."]), correctAnswer: "My mother, who is a teacher, loves reading.", explanation: "Non-defining clauses use commas and give extra info. 'My mother' is already specific, so the clause is extra.", order: 2 },
    { topicId: t4_2.id, type: "multiple_choice", difficulty: "intermediate", question: "In which sentence can the relative pronoun be omitted?", options: JSON.stringify(["The woman who called is my aunt.", "The cake that she made was delicious.", "The boy who won the prize is happy.", "The dog that bit me was large."]), correctAnswer: "The cake that she made was delicious.", explanation: "'That' is the object in 'she made (the cake)'. Object relative pronouns can be omitted: 'The cake she made...'", order: 3 },
    { topicId: t4_2.id, type: "fill_in_blank", difficulty: "intermediate", question: "The girl ___ bag was stolen reported it to the police.", correctAnswer: "whose", explanation: "'Whose' shows possession: the girl's bag → the girl whose bag.", order: 4 },
    { topicId: t4_2.id, type: "fill_in_blank", difficulty: "intermediate", question: "That is the restaurant ___ we had dinner last Friday.", correctAnswer: "where", explanation: "'Where' is the relative pronoun for places.", order: 5 },
    { topicId: t4_2.id, type: "error_correction", difficulty: "intermediate", question: "My father, that is 60 years old, still works every day.", correctAnswer: "My father, who is 60 years old, still works every day.", explanation: "In non-defining relative clauses, use 'who' for people, not 'that'.", order: 6 },
    { topicId: t4_2.id, type: "error_correction", difficulty: "intermediate", question: "The car who is parked outside belongs to my neighbor.", correctAnswer: "The car which is parked outside belongs to my neighbor.", explanation: "Use 'which' or 'that' for things, not 'who'. 'Who' is only for people.", order: 7 },
    { topicId: t4_2.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Combine: 'The woman is my teacher. She is wearing a red dress.'", correctAnswer: "The woman who is wearing a red dress is my teacher.", explanation: "Use 'who' to combine sentences about a person: 'The woman who is wearing a red dress...'", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 4.3: Noun Clauses ---
  const t4_3 = await db.grammarTopic.create({
    data: {
      categoryId: cat4.id,
      title: "Noun Clauses",
      slug: "noun-clauses",
      description: "Use clauses that function as nouns in sentences",
      level: "advanced",
      order: 3,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t4_3.id,
      content: `# Noun Clauses

A **noun clause** is a dependent clause that functions as a noun. It can serve as a subject, object, or complement in a sentence.

## Common Starters
- **that:** I know **that she is coming**.
- **what:** **What he said** surprised me.
- **how/why/when/where:** I don't know **where she lives**.
- **whether/if:** I wonder **whether/if it will rain**.
- **who/whom/which:** I don't know **who did it**.

## Functions of Noun Clauses

### As Subject
- **What you said** is true.
- **That she passed** the exam surprised everyone.

### As Object
- I believe **that she is honest**.
- She asked **where I was going**.

### As Complement
- The problem is **that we don't have enough time**.

### After Adjectives
- I am glad **that you came**.
- She was surprised **that he called**.

## Important Notes
- 'That' can often be omitted in object clauses: I think (that) she is right.
- Word order in noun clauses is NOT question order: I don't know **where she lives** (NOT where does she live).`,
      examples: JSON.stringify([
        "**What she said** made me happy. (subject)",
        "I don't know **where he went**. (object)",
        "The truth is **that nobody cares**. (complement)",
        "**Whether we go or stay** depends on the weather. (subject)",
        "I believe **(that) he is innocent**. ('that' can be omitted)",
        "She asked me **if I wanted coffee**. (object after 'asked')"
      ]),
      tips: "The most common mistake is using question word order inside a noun clause. Say 'I don't know where she lives' NOT 'I don't know where does she live.' The clause uses statement order (subject + verb), not question order.",
    },
  });
  for (const ex of [
    { topicId: t4_3.id, type: "multiple_choice", difficulty: "advanced", question: "Which contains a noun clause as the subject?", options: JSON.stringify(["That she left surprised us.", "She left the room.", "I know that she left.", "She is happy that she left."]), correctAnswer: "That she left surprised us.", explanation: "'That she left' is the subject of the verb 'surprised'. The entire clause acts as a noun.", order: 1 },
    { topicId: t4_3.id, type: "multiple_choice", difficulty: "advanced", question: "Choose the correct form: 'I don't know ___.'", options: JSON.stringify(["where does she live", "where she lives", "where she live", "where is she living"]), correctAnswer: "where she lives", explanation: "Noun clauses use statement word order (subject + verb), not question order.", order: 2 },
    { topicId: t4_3.id, type: "multiple_choice", difficulty: "advanced", question: "Which word introduces the noun clause? 'I wonder whether she will come.'", options: JSON.stringify(["I", "wonder", "whether", "come"]), correctAnswer: "whether", explanation: "'Whether' introduces the noun clause 'whether she will come', which is the object of 'wonder'.", order: 3 },
    { topicId: t4_3.id, type: "fill_in_blank", difficulty: "advanced", question: "I don't understand ___ he is angry.", correctAnswer: "why", explanation: "'Why' introduces a noun clause expressing reason: 'why he is angry' is the object.", order: 4 },
    { topicId: t4_3.id, type: "fill_in_blank", difficulty: "advanced", question: "___ you do with your life is your choice.", correctAnswer: "What", explanation: "'What you do with your life' is a noun clause functioning as the subject.", order: 5 },
    { topicId: t4_3.id, type: "error_correction", difficulty: "advanced", question: "I don't know where does she work.", correctAnswer: "I don't know where she works.", explanation: "In noun clauses, use statement word order: 'where she works', not 'where does she work'.", order: 6 },
    { topicId: t4_3.id, type: "error_correction", difficulty: "advanced", question: "Can you tell me what time is it?", correctAnswer: "Can you tell me what time it is?", explanation: "Inside a noun clause, use statement order: 'what time it is', not 'what time is it'.", order: 7 },
    { topicId: t4_3.id, type: "sentence_rewrite", difficulty: "advanced", question: "Combine: 'She said something. It surprised me.'", correctAnswer: "What she said surprised me.", explanation: "'What she said' is a noun clause functioning as the subject of 'surprised'.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 4.4: Adverbial Clauses ---
  const t4_4 = await db.grammarTopic.create({
    data: {
      categoryId: cat4.id,
      title: "Adverbial Clauses",
      slug: "adverbial-clauses",
      description: "Use clauses that function as adverbs to show time, reason, and condition",
      level: "advanced",
      order: 4,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t4_4.id,
      content: `# Adverbial Clauses

An **adverbial clause** is a dependent clause that functions as an adverb. It modifies a verb, adjective, or another adverb, answering questions like when, where, why, how, and under what condition.

## Types of Adverbial Clauses

### Time (when?)
- **when, while, before, after, since, until, as soon as, by the time**
- I'll call you **when I arrive**.
- **Before you leave**, turn off the lights.

### Reason/Cause (why?)
- **because, since, as**
- She stayed home **because she was sick**.

### Condition (under what condition?)
- **if, unless, provided that, as long as**
- **If it rains**, we'll stay inside.
- I won't go **unless you come with me**.

### Contrast/Concession (despite what?)
- **although, though, even though, whereas, while**
- **Although it was expensive**, I bought it.

### Purpose (for what purpose?)
- **so that, in order that**
- She studied hard **so that she could pass**.

### Result (with what result?)
- **so...that, such...that**
- It was **so hot that** we stayed inside.

## Punctuation
- Adverbial clause FIRST → use a comma: **Because it rained,** we stayed home.
- Adverbial clause SECOND → usually no comma: We stayed home **because it rained**.`,
      examples: JSON.stringify([
        "**When the movie ended**, we went home. (time)",
        "She was happy **because she got the job**. (reason)",
        "**If you study hard**, you will pass. (condition)",
        "**Although he is young**, he is very mature. (contrast)",
        "I saved money **so that I could buy a car**. (purpose)",
        "The movie was **so boring that** I fell asleep. (result)"
      ]),
      tips: "Remember the comma rule: when the adverbial clause comes at the beginning of the sentence, always use a comma after it. When it comes at the end, usually no comma is needed (except with contrast clauses like 'although').",
    },
  });
  for (const ex of [
    { topicId: t4_4.id, type: "multiple_choice", difficulty: "advanced", question: "Identify the type of adverbial clause: 'Because it was late, we went home.'", options: JSON.stringify(["time", "reason", "condition", "contrast"]), correctAnswer: "reason", explanation: "'Because' introduces a reason clause, explaining why we went home.", order: 1 },
    { topicId: t4_4.id, type: "multiple_choice", difficulty: "advanced", question: "Choose the correct conjunction: '___ you work hard, you won't succeed.'", options: JSON.stringify(["Although", "Because", "Unless", "While"]), correctAnswer: "Unless", explanation: "'Unless' means 'if not'. If you don't work hard, you won't succeed.", order: 2 },
    { topicId: t4_4.id, type: "multiple_choice", difficulty: "advanced", question: "Which sentence has a purpose clause?", options: JSON.stringify(["She left because she was tired.", "She left so that she could rest.", "She left although she wanted to stay.", "She left when the party ended."]), correctAnswer: "She left so that she could rest.", explanation: "'So that' introduces a purpose clause explaining why she left.", order: 3 },
    { topicId: t4_4.id, type: "fill_in_blank", difficulty: "advanced", question: "___ she was nervous, she gave an excellent presentation.", correctAnswer: "Although|Even though|Though", explanation: "A contrast conjunction shows that despite being nervous, she performed well.", order: 4 },
    { topicId: t4_4.id, type: "fill_in_blank", difficulty: "advanced", question: "I'll wait ___ you finish your work.", correctAnswer: "until|till", explanation: "'Until/till' means 'up to the time when'. I'll wait for the duration.", order: 5 },
    { topicId: t4_4.id, type: "error_correction", difficulty: "advanced", question: "Although she was tired but she kept working.", correctAnswer: "Although she was tired, she kept working.", explanation: "'Although' and 'but' both show contrast. Using both is redundant. Remove 'but'.", order: 6 },
    { topicId: t4_4.id, type: "error_correction", difficulty: "advanced", question: "I will call you as soon as I will arrive.", correctAnswer: "I will call you as soon as I arrive.", explanation: "After time conjunctions (when, as soon as, before, after), use present tense for future meaning, not 'will'.", order: 7 },
    { topicId: t4_4.id, type: "sentence_rewrite", difficulty: "advanced", question: "Combine with an adverbial clause: 'She was very tired. She continued working.'", correctAnswer: "Although she was very tired, she continued working.|Even though she was very tired, she continued working.", explanation: "'Although/Even though' creates a contrast adverbial clause.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 4.5: Complex & Compound Sentences ---
  const t4_5 = await db.grammarTopic.create({
    data: {
      categoryId: cat4.id,
      title: "Complex & Compound Sentences",
      slug: "complex-compound-sentences",
      description: "Build sophisticated sentences by combining clauses effectively",
      level: "intermediate",
      order: 5,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t4_5.id,
      content: `# Complex & Compound Sentences

Understanding sentence types helps you write with variety and sophistication.

## Four Sentence Types

### 1. Simple Sentence
One independent clause.
- **She likes coffee.**

### 2. Compound Sentence
Two or more independent clauses joined by a coordinating conjunction (FANBOYS) or semicolon.
- She likes coffee**, but** he prefers tea.
- She likes coffee**;** he prefers tea.

### 3. Complex Sentence
One independent clause + one or more dependent clauses (joined by subordinating conjunction or relative pronoun).
- **Although she was tired**, she finished her work.
- The man **who lives next door** is a pilot.

### 4. Compound-Complex Sentence
Two or more independent clauses + at least one dependent clause.
- **Although it was late**, she finished her work**, and** she went to bed.

## How to Combine
- **Coordinating conjunctions** (FANBOYS): join equal clauses
- **Subordinating conjunctions** (because, when, if, although): make one clause dependent
- **Semicolons:** join closely related independent clauses
- **Relative pronouns** (who, which, that): add information about nouns

## Avoiding Common Errors
- **Run-on:** She likes coffee he likes tea. (no connection)
- **Comma splice:** She likes coffee, he likes tea. (comma alone is not enough)
- Fix: Add a conjunction, use a semicolon, or make two sentences.`,
      examples: JSON.stringify([
        "**Simple:** The cat sat on the mat.",
        "**Compound:** The cat sat on the mat, and the dog lay on the floor.",
        "**Complex:** The cat sat on the mat because it was warm.",
        "**Compound-Complex:** Although it was late, the cat sat on the mat, and the dog slept.",
        "She studied hard; therefore, she passed the exam. (semicolon + conjunctive adverb)",
        "The teacher who taught us grammar, which was my favorite subject, retired last year."
      ]),
      tips: "Varying your sentence types makes your writing more interesting. Use simple sentences for impact, compound for connecting equal ideas, and complex for showing relationships between ideas (cause-effect, time, contrast).",
    },
  });
  for (const ex of [
    { topicId: t4_5.id, type: "multiple_choice", difficulty: "intermediate", question: "What type is: 'She went to the store, and she bought some milk.'?", options: JSON.stringify(["simple", "compound", "complex", "compound-complex"]), correctAnswer: "compound", explanation: "Two independent clauses joined by 'and' (coordinating conjunction) = compound sentence.", order: 1 },
    { topicId: t4_5.id, type: "multiple_choice", difficulty: "intermediate", question: "What type is: 'Because it was raining, I stayed home.'?", options: JSON.stringify(["simple", "compound", "complex", "compound-complex"]), correctAnswer: "complex", explanation: "One independent clause + one dependent clause (starting with 'because') = complex sentence.", order: 2 },
    { topicId: t4_5.id, type: "multiple_choice", difficulty: "intermediate", question: "Which is a run-on sentence?", options: JSON.stringify(["She is happy, and he is sad.", "She is happy he is sad.", "Although she is happy, he is sad.", "She is happy; he is sad."]), correctAnswer: "She is happy he is sad.", explanation: "Two independent clauses with no conjunction or punctuation = run-on sentence.", order: 3 },
    { topicId: t4_5.id, type: "fill_in_blank", difficulty: "intermediate", question: "She wanted to go out, ___ it was raining.", correctAnswer: "but", explanation: "'But' is a coordinating conjunction that joins two contrasting independent clauses.", order: 4 },
    { topicId: t4_5.id, type: "fill_in_blank", difficulty: "intermediate", question: "I'll help you ___ you ask me.", correctAnswer: "if|whenever|when", explanation: "A subordinating conjunction creates a complex sentence with a condition or time clause.", order: 5 },
    { topicId: t4_5.id, type: "error_correction", difficulty: "intermediate", question: "She likes coffee, he prefers tea.", correctAnswer: "She likes coffee, but he prefers tea.", explanation: "This is a comma splice. Add a coordinating conjunction ('but' for contrast) to fix it.", order: 6 },
    { topicId: t4_5.id, type: "error_correction", difficulty: "intermediate", question: "I was tired I went to bed early.", correctAnswer: "I was tired, so I went to bed early.", explanation: "This is a run-on sentence. Add a comma and conjunction ('so' for result) to connect the clauses.", order: 7 },
    { topicId: t4_5.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Combine into a compound-complex sentence: 'It was late. She finished her work. She went to bed.'", correctAnswer: "Although it was late, she finished her work, and she went to bed.", explanation: "Use 'although' for a dependent clause and 'and' to join two independent clauses.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  console.log("  Category 4: Clauses & Sentences - 5 topics seeded");

  // ============================================================
  // CATEGORY 5: Modal Verbs
  // ============================================================
  const cat5 = await db.grammarCategory.create({
    data: {
      name: "Modal Verbs",
      slug: "modal-verbs",
      description: "Express ability, permission, obligation, and possibility",
      icon: "Zap",
      order: 5,
    },
  });

  // --- Topic 5.1: Can & Could ---
  const t5_1 = await db.grammarTopic.create({
    data: {
      categoryId: cat5.id,
      title: "Can & Could",
      slug: "can-and-could",
      description: "Express ability, possibility, and requests",
      level: "beginner",
      order: 1,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t5_1.id,
      content: `# Can & Could

**Can** and **could** are modal verbs used to express ability, possibility, permission, and requests.

## Can

### Ability (present)
- I **can** swim. She **can** speak three languages.

### Permission (informal)
- **Can** I use your phone?

### Possibility (general)
- Summers in Turkey **can** be very hot.

### Negative: cannot / can't
- I **can't** drive.

## Could

### Past ability
- When I was young, I **could** run very fast.

### Polite requests (more formal than 'can')
- **Could** you please help me?

### Possibility (less certain than 'can')
- It **could** rain later. (possible but uncertain)

### Suggestions
- We **could** go to the cinema tonight.

## Can vs Could
- **Can** = present ability, informal requests
- **Could** = past ability, polite requests, less certain possibility
- For future ability, use **will be able to**: She **will be able to** drive next year.`,
      examples: JSON.stringify([
        "She **can** play the piano very well. (present ability)",
        "**Can** I borrow your pen? (informal permission)",
        "I **could** read when I was four. (past ability)",
        "**Could** you open the window, please? (polite request)",
        "He **could** be at the office. (uncertain possibility)",
        "We **can't** park here. It's not allowed. (inability/prohibition)"
      ]),
      tips: "For polite requests, 'could' is softer than 'can'. 'Could you help me?' sounds more polite than 'Can you help me?' For past ability with a specific action, use 'was/were able to' instead of 'could': 'I was able to finish on time' (specific), 'I could swim as a child' (general ability).",
    },
  });
  for (const ex of [
    { topicId: t5_1.id, type: "multiple_choice", difficulty: "beginner", question: "Choose: 'When she was five, she ___ ride a bicycle.'", options: JSON.stringify(["can", "could", "will can", "cans"]), correctAnswer: "could", explanation: "Use 'could' for past ability. 'When she was five' is past tense.", order: 1 },
    { topicId: t5_1.id, type: "multiple_choice", difficulty: "beginner", question: "Which is more polite?", options: JSON.stringify(["Can you pass the salt?", "Could you pass the salt?", "Pass the salt!", "You pass the salt."]), correctAnswer: "Could you pass the salt?", explanation: "'Could you...?' is more polite and formal than 'Can you...?'", order: 2 },
    { topicId: t5_1.id, type: "multiple_choice", difficulty: "beginner", question: "'It ___ be true, but I'm not sure.'", options: JSON.stringify(["can", "could", "must", "will"]), correctAnswer: "could", explanation: "'Could' expresses uncertain possibility — it's possible but not certain.", order: 3 },
    { topicId: t5_1.id, type: "fill_in_blank", difficulty: "beginner", question: "She ___ speak four languages fluently.", correctAnswer: "can", explanation: "'Can' expresses present ability.", order: 4 },
    { topicId: t5_1.id, type: "fill_in_blank", difficulty: "beginner", question: "___ I use your computer? I need to check my email.", correctAnswer: "Can|Could|May", explanation: "'Can', 'Could', or 'May' are used to ask for permission.", order: 5 },
    { topicId: t5_1.id, type: "error_correction", difficulty: "beginner", question: "She can to swim very well.", correctAnswer: "She can swim very well.", explanation: "After modal verbs, use the base form of the verb without 'to'.", order: 6 },
    { topicId: t5_1.id, type: "error_correction", difficulty: "beginner", question: "He cans speak three languages.", correctAnswer: "He can speak three languages.", explanation: "Modal verbs never take -s, even with he/she/it. It is always 'can', never 'cans'.", order: 7 },
    { topicId: t5_1.id, type: "sentence_rewrite", difficulty: "beginner", question: "Rewrite for the future: 'She can drive.' (next year)", correctAnswer: "She will be able to drive next year.", explanation: "'Can' doesn't have a future form. Use 'will be able to' for future ability.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 5.2: May & Might ---
  const t5_2 = await db.grammarTopic.create({
    data: {
      categoryId: cat5.id,
      title: "May & Might",
      slug: "may-and-might",
      description: "Express possibility and ask for formal permission",
      level: "intermediate",
      order: 2,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t5_2.id,
      content: `# May & Might

**May** and **might** express possibility and permission.

## May
### Possibility (50/50 chance)
- It **may** rain tomorrow. (it's possible)

### Formal permission
- **May** I come in? (very polite)
- You **may** leave now. (granting permission)

## Might
### Possibility (less likely than may)
- She **might** come to the party. (less certain)

### Tentative suggestions
- You **might** want to check the schedule.

## May vs Might
- **May** = slightly more likely / more formal permission
- **Might** = slightly less likely / no permission use
- In practice, they are often interchangeable for possibility.

## Negative Forms
- She **may not** come. (possibility she won't)
- She **might not** come. (slightly less likely)
- You **may not** park here. (prohibition — formal)

## Past Possibility
- She **may have been** at home. (maybe she was)
- He **might have forgotten**. (maybe he forgot)`,
      examples: JSON.stringify([
        "It **may** rain this afternoon. (possibility)",
        "**May** I sit here? (formal permission)",
        "She **might** be at the library. (less certain possibility)",
        "They **may not** agree with the plan. (possible disagreement)",
        "He **might have missed** the bus. (past possibility)",
        "You **may** go now. (granting permission)"
      ]),
      tips: "For permission, 'may' is the most formal option. In order of formality: May I...? (formal) > Could I...? (polite) > Can I...? (informal). For possibility, 'may' and 'might' are nearly interchangeable, but 'might' suggests slightly less certainty.",
    },
  });
  for (const ex of [
    { topicId: t5_2.id, type: "multiple_choice", difficulty: "intermediate", question: "Which expresses formal permission?", options: JSON.stringify(["Can I leave?", "May I leave?", "Might I leave?", "Should I leave?"]), correctAnswer: "May I leave?", explanation: "'May I...?' is the most formal way to ask for permission.", order: 1 },
    { topicId: t5_2.id, type: "multiple_choice", difficulty: "intermediate", question: "She ___ come to the party. She hasn't decided yet.", options: JSON.stringify(["will", "must", "might", "should"]), correctAnswer: "might", explanation: "'Might' expresses uncertain possibility — she hasn't decided, so it's uncertain.", order: 2 },
    { topicId: t5_2.id, type: "multiple_choice", difficulty: "intermediate", question: "He ___ have forgotten about the meeting. He's not here.", options: JSON.stringify(["may", "will", "can", "shall"]), correctAnswer: "may", explanation: "'May have + past participle' expresses past possibility. Maybe he forgot.", order: 3 },
    { topicId: t5_2.id, type: "fill_in_blank", difficulty: "intermediate", question: "Take an umbrella. It ___ rain later.", correctAnswer: "may|might", explanation: "Both 'may' and 'might' express possibility about future weather.", order: 4 },
    { topicId: t5_2.id, type: "fill_in_blank", difficulty: "intermediate", question: "She ___ ___ ___ the email. Check with her. (not read — past possibility)", correctAnswer: "may not have read|might not have read", explanation: "May/might + not + have + past participle expresses past negative possibility.", order: 5 },
    { topicId: t5_2.id, type: "error_correction", difficulty: "intermediate", question: "She mights be at home.", correctAnswer: "She might be at home.", explanation: "Modal verbs never take -s. It's always 'might', never 'mights'.", order: 6 },
    { topicId: t5_2.id, type: "error_correction", difficulty: "intermediate", question: "May you help me with this?", correctAnswer: "Could you help me with this?", explanation: "'May' is not typically used to make requests. Use 'Could' or 'Can' for requests. 'May' is for permission.", order: 7 },
    { topicId: t5_2.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Express past possibility: 'Maybe she forgot her keys.'", correctAnswer: "She may have forgotten her keys.|She might have forgotten her keys.", explanation: "May/might + have + past participle expresses past possibility.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 5.3: Must & Have to ---
  const t5_3 = await db.grammarTopic.create({
    data: {
      categoryId: cat5.id,
      title: "Must & Have to",
      slug: "must-and-have-to",
      description: "Express obligation, necessity, and strong deduction",
      level: "intermediate",
      order: 3,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t5_3.id,
      content: `# Must & Have to

**Must** and **have to** both express obligation and necessity, but with important differences.

## Must
### Strong obligation (personal/internal)
- I **must** finish this report by tomorrow. (I feel it's necessary)

### Rules and laws
- You **must** wear a seatbelt. (it's the law)

### Strong deduction/certainty
- She **must** be tired. She's been working all day. (I'm sure)

### Negative: must not (mustn't) = prohibition
- You **mustn't** smoke here. (it's not allowed)

## Have to
### External obligation
- I **have to** wear a uniform at work. (it's required by my employer)

### Negative: don't have to = no obligation (it's your choice)
- You **don't have to** come if you don't want to. (it's optional)

## Must vs Have to
- **Must** = the speaker decides / internal motivation / deduction
- **Have to** = external rules / someone else decides
- **Mustn't** = prohibited (DON'T do it!)
- **Don't have to** = optional (you CAN but you don't NEED to)

## Past Form
- Must has no past form. Use **had to** for past obligation.
- I **had to** work late yesterday.`,
      examples: JSON.stringify([
        "You **must** be quiet in the library. (rule)",
        "I **have to** get up early for work. (external obligation)",
        "You **mustn't** use your phone during the exam. (prohibition)",
        "You **don't have to** bring food. We have enough. (no obligation)",
        "She **must** be very rich. Look at her house! (deduction)",
        "I **had to** take a taxi because I missed the bus. (past obligation)"
      ]),
      tips: "The key difference is in the negatives: 'mustn't' = DON'T DO IT (forbidden), 'don't have to' = it's not necessary (your choice). This is a very common test question and a frequent mistake for ESL learners!",
    },
  });
  for (const ex of [
    { topicId: t5_3.id, type: "multiple_choice", difficulty: "intermediate", question: "You ___ drive without a license. It's illegal.", options: JSON.stringify(["don't have to", "mustn't", "shouldn't", "might not"]), correctAnswer: "mustn't", explanation: "Driving without a license is forbidden by law. 'Mustn't' = prohibition.", order: 1 },
    { topicId: t5_3.id, type: "multiple_choice", difficulty: "intermediate", question: "You ___ come to the party. It's your choice.", options: JSON.stringify(["mustn't", "don't have to", "can't", "must"]), correctAnswer: "don't have to", explanation: "'Don't have to' means there is no obligation — it's optional.", order: 2 },
    { topicId: t5_3.id, type: "multiple_choice", difficulty: "intermediate", question: "She's been studying for hours. She ___ be exhausted.", options: JSON.stringify(["can", "might", "must", "should"]), correctAnswer: "must", explanation: "'Must' for strong deduction based on evidence. You're almost certain she's exhausted.", order: 3 },
    { topicId: t5_3.id, type: "fill_in_blank", difficulty: "intermediate", question: "I ___ ___ wear a uniform at school. It was a requirement.", correctAnswer: "had to", explanation: "Past obligation uses 'had to' since 'must' has no past form.", order: 4 },
    { topicId: t5_3.id, type: "fill_in_blank", difficulty: "intermediate", question: "You ___ touch that wire! It's dangerous!", correctAnswer: "mustn't|must not", explanation: "'Mustn't' expresses strong prohibition — touching the wire is forbidden because it's dangerous.", order: 5 },
    { topicId: t5_3.id, type: "error_correction", difficulty: "intermediate", question: "She must to go to the dentist tomorrow.", correctAnswer: "She must go to the dentist tomorrow.", explanation: "After 'must', use the base verb directly without 'to'.", order: 6 },
    { topicId: t5_3.id, type: "error_correction", difficulty: "intermediate", question: "I musted work late yesterday.", correctAnswer: "I had to work late yesterday.", explanation: "'Must' doesn't have a past form. Use 'had to' for past obligation.", order: 7 },
    { topicId: t5_3.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Rewrite with 'must' (deduction): 'I'm sure she is at home.'", correctAnswer: "She must be at home.", explanation: "'Must' + base verb expresses a strong deduction (you're sure based on evidence/logic).", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 5.4: Should & Ought to ---
  const t5_4 = await db.grammarTopic.create({
    data: {
      categoryId: cat5.id,
      title: "Should & Ought to",
      slug: "should-and-ought-to",
      description: "Give advice, express expectations, and make recommendations",
      level: "intermediate",
      order: 4,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t5_4.id,
      content: `# Should & Ought to

**Should** and **ought to** are used for advice, recommendations, expectations, and mild obligation.

## Should
### Advice/Recommendation
- You **should** see a doctor. (my advice)
- You **shouldn't** eat so much junk food.

### Expectation
- The package **should** arrive tomorrow. (I expect it)

### Mild obligation/duty
- Students **should** respect their teachers.

### Past: should have + past participle (regret/criticism)
- You **should have studied** harder. (but you didn't — regret)
- She **shouldn't have said** that. (but she did — criticism)

## Ought to
- Almost identical in meaning to 'should' but more formal and less common.
- You **ought to** exercise more.
- He **ought to** apologize.
- Negative: You **ought not to** (rarely used; 'shouldn't' is preferred)

## Should vs Must
- **Should** = it's a good idea, advisable (soft)
- **Must** = it's necessary, obligatory (strong)
- You **should** study. (advice) vs You **must** study. (you have no choice)`,
      examples: JSON.stringify([
        "You **should** get more sleep. (advice)",
        "He **shouldn't** drive so fast. (negative advice)",
        "The movie **should** be good. (expectation)",
        "You **should have told** me earlier. (past regret)",
        "She **ought to** be more careful. (formal advice)",
        "Students **should** arrive on time. (mild obligation)"
      ]),
      tips: "'Should have + past participle' is one of the most useful structures in English. It expresses regret or criticism about the past: 'I should have studied' = I regret not studying. 'You shouldn't have said that' = that was wrong of you to say.",
    },
  });
  for (const ex of [
    { topicId: t5_4.id, type: "multiple_choice", difficulty: "intermediate", question: "You look tired. You ___ get some rest.", options: JSON.stringify(["must", "should", "will", "can"]), correctAnswer: "should", explanation: "'Should' gives friendly advice. 'Must' would be too strong for a suggestion.", order: 1 },
    { topicId: t5_4.id, type: "multiple_choice", difficulty: "intermediate", question: "She failed the exam. She ___ harder.", options: JSON.stringify(["should study", "should have studied", "must study", "ought study"]), correctAnswer: "should have studied", explanation: "'Should have studied' expresses regret about a past action — she didn't study enough.", order: 2 },
    { topicId: t5_4.id, type: "multiple_choice", difficulty: "intermediate", question: "Which is more formal?", options: JSON.stringify(["You should apologize.", "You ought to apologize.", "You must apologize.", "You could apologize."]), correctAnswer: "You ought to apologize.", explanation: "'Ought to' is the formal equivalent of 'should' for advice.", order: 3 },
    { topicId: t5_4.id, type: "fill_in_blank", difficulty: "intermediate", question: "You ___ eat more vegetables. They're good for your health.", correctAnswer: "should|ought to", explanation: "'Should' or 'ought to' gives advice about healthy eating.", order: 4 },
    { topicId: t5_4.id, type: "fill_in_blank", difficulty: "intermediate", question: "I ___ ___ ___ that rude email. I regret it. (not send)", correctAnswer: "shouldn't have sent", explanation: "'Shouldn't have + past participle' expresses regret about a past action.", order: 5 },
    { topicId: t5_4.id, type: "error_correction", difficulty: "intermediate", question: "You should to study harder.", correctAnswer: "You should study harder.", explanation: "After 'should', use the base verb directly without 'to'. (But 'ought to' does use 'to'.)", order: 6 },
    { topicId: t5_4.id, type: "error_correction", difficulty: "intermediate", question: "He should has called earlier.", correctAnswer: "He should have called earlier.", explanation: "The structure is 'should have + past participle', not 'should has'.", order: 7 },
    { topicId: t5_4.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Express regret: 'I didn't bring an umbrella. Now I'm wet.'", correctAnswer: "I should have brought an umbrella.", explanation: "'Should have + past participle' expresses regret about not doing something.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 5.5: Will & Would ---
  const t5_5 = await db.grammarTopic.create({
    data: {
      categoryId: cat5.id,
      title: "Will & Would",
      slug: "will-and-would",
      description: "Express willingness, habits, and hypothetical situations",
      level: "intermediate",
      order: 5,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t5_5.id,
      content: `# Will & Would

Beyond future tense, **will** and **would** have several modal uses.

## Will (Modal Uses)
### Willingness/Refusal
- I**'ll** help you. (willingness)
- She **won't** listen to me. (refusal)

### Habits/Typical behavior
- He**'ll** sit there for hours reading. (typical behavior)

### Requests
- **Will** you pass me the salt?

### Promises/Threats
- I **will** always love you. (promise)

## Would (Modal Uses)
### Polite requests (more polite than will)
- **Would** you mind closing the door?

### Hypothetical/Imaginary situations
- I **would** travel the world if I had money.
- What **would** you do in my situation?

### Past habits (similar to 'used to')
- When I was young, I **would** play outside every day.

### Preference
- I **would** rather stay home. (I'd rather...)
- I **would** like a cup of tea, please. (I'd like...)

## Will vs Would
- **Will** = present/future willingness, certainty
- **Would** = politeness, hypothetical, past habits, preferences`,
      examples: JSON.stringify([
        "I**'ll** carry that for you. (willingness)",
        "The car **won't** start. (refusal — personification)",
        "**Would** you like some coffee? (polite offer)",
        "If I were rich, I **would** buy a yacht. (hypothetical)",
        "We **would** always go fishing on Sundays. (past habit)",
        "I**'d rather** have tea than coffee. (preference)"
      ]),
      tips: "'Would you like...?' is much more polite than 'Do you want...?' Use 'would' in hypothetical situations (if clauses, imaginary scenarios). For past habits, 'would' and 'used to' are similar, but 'used to' can also describe past states, while 'would' cannot: 'I used to live in Istanbul' (state — cannot use 'would').",
    },
  });
  for (const ex of [
    { topicId: t5_5.id, type: "multiple_choice", difficulty: "intermediate", question: "'___ you like some more tea?' Which is most polite?", options: JSON.stringify(["Do", "Will", "Would", "Can"]), correctAnswer: "Would", explanation: "'Would you like...?' is the most polite way to offer something.", order: 1 },
    { topicId: t5_5.id, type: "multiple_choice", difficulty: "intermediate", question: "If I had a million dollars, I ___ travel the world.", options: JSON.stringify(["will", "would", "can", "should"]), correctAnswer: "would", explanation: "Hypothetical/imaginary situations use 'would' in the main clause (second conditional).", order: 2 },
    { topicId: t5_5.id, type: "multiple_choice", difficulty: "intermediate", question: "When we were kids, we ___ play in the garden every day.", options: JSON.stringify(["will", "would", "should", "can"]), correctAnswer: "would", explanation: "'Would' describes repeated past habits, similar to 'used to'.", order: 3 },
    { topicId: t5_5.id, type: "fill_in_blank", difficulty: "intermediate", question: "I ___ rather stay home tonight.", correctAnswer: "would|'d", explanation: "'Would rather' (I'd rather) expresses preference.", order: 4 },
    { topicId: t5_5.id, type: "fill_in_blank", difficulty: "intermediate", question: "The door ___ open. I think it's stuck.", correctAnswer: "won't|will not", explanation: "'Won't' can personify objects to express refusal: the door refuses to open.", order: 5 },
    { topicId: t5_5.id, type: "error_correction", difficulty: "intermediate", question: "Would you like go to the cinema?", correctAnswer: "Would you like to go to the cinema?", explanation: "'Would like' is followed by 'to + infinitive': 'would like to go'.", order: 6 },
    { topicId: t5_5.id, type: "error_correction", difficulty: "intermediate", question: "If I was rich, I will buy a house.", correctAnswer: "If I were rich, I would buy a house.", explanation: "Second conditional uses 'were' (not 'was') and 'would' (not 'will') for hypothetical situations.", order: 7 },
    { topicId: t5_5.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Make more polite: 'Do you want some coffee?'", correctAnswer: "Would you like some coffee?", explanation: "'Would you like...?' is the polite equivalent of 'Do you want...?'", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  console.log("  Category 5: Modal Verbs - 5 topics seeded");

  // ============================================================
  // CATEGORY 6: Conditionals
  // ============================================================
  const cat6 = await db.grammarCategory.create({
    data: {
      name: "Conditionals",
      slug: "conditionals",
      description: "Express conditions and their consequences using if-clauses",
      icon: "GitBranch",
      order: 6,
    },
  });

  // --- Topic 6.1: Zero Conditional ---
  const t6_1 = await db.grammarTopic.create({
    data: {
      categoryId: cat6.id,
      title: "Zero Conditional",
      slug: "zero-conditional",
      description: "Express general truths and scientific facts with if-clauses",
      level: "beginner",
      order: 1,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t6_1.id,
      content: `# Zero Conditional

The **zero conditional** is used for general truths, scientific facts, and things that are always true when the condition is met.

## Form
**If + present simple, present simple**

- **If** you heat water to 100°C, it **boils**.
- **If** I eat too much, I **feel** sick.

## Key Points
- Both clauses use **present simple**.
- 'If' can be replaced with 'when' (because the result always happens).
- The condition and result are always true — it's not about a specific situation.

## Usage
1. **Scientific facts:** If you freeze water, it turns to ice.
2. **General truths:** If you don't water plants, they die.
3. **Rules/Instructions:** If the alarm goes off, leave the building.
4. **Habits:** If I wake up early, I go for a run.

## Comma Rule
- If clause first → comma: **If you heat ice, it melts.**
- If clause second → no comma: Ice melts **if you heat it.**`,
      examples: JSON.stringify([
        "**If** you mix red and blue, you **get** purple. (fact)",
        "**If** it rains, the ground **gets** wet. (general truth)",
        "**If** you touch fire, it **burns**. (always true)",
        "Plants die **if** they don't get water. (general truth)",
        "**If** I drink coffee late, I **can't** sleep. (personal truth)",
        "**When/If** the sun sets, it **gets** dark. (natural law)"
      ]),
      tips: "Zero conditional = always true. Think of it as a cause-and-effect relationship that is universal. You can test it: if you can replace 'if' with 'when' and the meaning stays the same, it's a zero conditional.",
    },
  });
  for (const ex of [
    { topicId: t6_1.id, type: "multiple_choice", difficulty: "beginner", question: "If you heat ice, it ___.", options: JSON.stringify(["melted", "will melt", "melts", "would melt"]), correctAnswer: "melts", explanation: "Zero conditional uses present simple in both clauses for scientific facts.", order: 1 },
    { topicId: t6_1.id, type: "multiple_choice", difficulty: "beginner", question: "Which is a zero conditional?", options: JSON.stringify(["If it rains tomorrow, I'll stay home.", "If it rains, the ground gets wet.", "If I had money, I would travel.", "If I had studied, I would have passed."]), correctAnswer: "If it rains, the ground gets wet.", explanation: "Zero conditional: present simple + present simple for general truths (always true).", order: 2 },
    { topicId: t6_1.id, type: "multiple_choice", difficulty: "beginner", question: "In zero conditional, 'if' can often be replaced by:", options: JSON.stringify(["would", "will", "when", "might"]), correctAnswer: "when", explanation: "Because the result always happens, 'if' and 'when' are interchangeable in zero conditional.", order: 3 },
    { topicId: t6_1.id, type: "fill_in_blank", difficulty: "beginner", question: "If you ___ water to 100°C, it boils. (heat)", correctAnswer: "heat", explanation: "Zero conditional: both clauses use present simple.", order: 4 },
    { topicId: t6_1.id, type: "fill_in_blank", difficulty: "beginner", question: "Metal ___ if you heat it.", correctAnswer: "expands|melts", explanation: "Present simple in the result clause for a scientific fact.", order: 5 },
    { topicId: t6_1.id, type: "error_correction", difficulty: "beginner", question: "If you will mix yellow and blue, you get green.", correctAnswer: "If you mix yellow and blue, you get green.", explanation: "Zero conditional uses present simple in both clauses, not 'will'.", order: 6 },
    { topicId: t6_1.id, type: "error_correction", difficulty: "beginner", question: "If ice melts it becomes water.", correctAnswer: "If ice melts, it becomes water.", explanation: "When the if-clause comes first, use a comma before the main clause.", order: 7 },
    { topicId: t6_1.id, type: "sentence_rewrite", difficulty: "beginner", question: "Write as zero conditional: 'Plants need water. Without water, they die.'", correctAnswer: "If plants don't get water, they die.|Plants die if they don't get water.", explanation: "Zero conditional expresses a general truth: present simple in both clauses.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 6.2: First Conditional ---
  const t6_2 = await db.grammarTopic.create({
    data: {
      categoryId: cat6.id,
      title: "First Conditional",
      slug: "first-conditional",
      description: "Talk about real possibilities in the future",
      level: "beginner",
      order: 2,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t6_2.id,
      content: `# First Conditional

The **first conditional** is used for real, possible situations in the future.

## Form
**If + present simple, will + base verb**

- **If** it rains, I **will stay** home.
- I **will call** you **if** I need help.

## Key Points
- The if-clause uses **present simple** (NOT future).
- The main clause uses **will + base verb**.
- The situation is real and possible — it may or may not happen.

## Variations
- **If** + present simple, **can/may/might/should** + base verb:
  - If you finish early, you **can** leave.
  - If it rains, we **might** cancel the picnic.
- **Unless** = if not:
  - **Unless** you hurry, you **will** be late.
  - = If you **don't** hurry, you will be late.

## Usage
1. **Future predictions:** If you study hard, you will pass.
2. **Promises:** If you help me, I'll buy you lunch.
3. **Warnings:** If you don't wear a coat, you'll catch a cold.
4. **Negotiations:** If you lower the price, I'll buy two.`,
      examples: JSON.stringify([
        "**If** you study hard, you **will pass** the exam. (likely future)",
        "I **won't go** to the party **if** you don't come. (warning/promise)",
        "**If** she calls, tell her I'm busy. (imperative in result clause)",
        "**Unless** you leave now, you **will miss** the bus. (unless = if not)",
        "**If** it's sunny tomorrow, we **might** go to the beach. (possibility)",
        "You **can** borrow my car **if** you drive carefully. (permission)"
      ]),
      tips: "NEVER use 'will' in the if-clause! Say 'If it rains, I will stay home' NOT 'If it will rain, I will stay home.' The if-clause uses present simple to talk about a future condition.",
    },
  });
  for (const ex of [
    { topicId: t6_2.id, type: "multiple_choice", difficulty: "beginner", question: "If it rains tomorrow, I ___ at home.", options: JSON.stringify(["stay", "stayed", "will stay", "would stay"]), correctAnswer: "will stay", explanation: "First conditional: if + present simple, will + base verb for real future possibilities.", order: 1 },
    { topicId: t6_2.id, type: "multiple_choice", difficulty: "beginner", question: "Which is correct first conditional?", options: JSON.stringify(["If I will see her, I tell her.", "If I see her, I will tell her.", "If I saw her, I would tell her.", "If I see her, I told her."]), correctAnswer: "If I see her, I will tell her.", explanation: "First conditional: If + present simple (see), will + base verb (will tell).", order: 2 },
    { topicId: t6_2.id, type: "multiple_choice", difficulty: "beginner", question: "___ you hurry, you will be late.", options: JSON.stringify(["If", "Unless", "When", "Both A and B could work with different meanings"]), correctAnswer: "Unless", explanation: "'Unless you hurry' = 'If you don't hurry'. Both lead to being late.", order: 3 },
    { topicId: t6_2.id, type: "fill_in_blank", difficulty: "beginner", question: "If you ___ hard, you will succeed. (work)", correctAnswer: "work", explanation: "First conditional: the if-clause uses present simple, even for future meaning.", order: 4 },
    { topicId: t6_2.id, type: "fill_in_blank", difficulty: "beginner", question: "If she ___ the exam, her parents will be very happy.", correctAnswer: "passes", explanation: "Present simple in the if-clause. 'She' takes verb + s: passes.", order: 5 },
    { topicId: t6_2.id, type: "error_correction", difficulty: "beginner", question: "If it will rain, I will take an umbrella.", correctAnswer: "If it rains, I will take an umbrella.", explanation: "Don't use 'will' in the if-clause. Use present simple: 'If it rains'.", order: 6 },
    { topicId: t6_2.id, type: "error_correction", difficulty: "beginner", question: "Unless you don't study, you will fail.", correctAnswer: "Unless you study, you will fail.", explanation: "'Unless' already means 'if not'. Don't add 'don't' — it creates a double negative.", order: 7 },
    { topicId: t6_2.id, type: "sentence_rewrite", difficulty: "beginner", question: "Rewrite with 'unless': 'If you don't leave now, you will miss the train.'", correctAnswer: "Unless you leave now, you will miss the train.", explanation: "'Unless' = 'if not'. Remove 'don't' when changing 'if' to 'unless'.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 6.3: Second Conditional ---
  const t6_3 = await db.grammarTopic.create({
    data: {
      categoryId: cat6.id,
      title: "Second Conditional",
      slug: "second-conditional",
      description: "Talk about unreal or hypothetical present/future situations",
      level: "intermediate",
      order: 3,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t6_3.id,
      content: `# Second Conditional

The **second conditional** is used for hypothetical, unreal, or unlikely situations in the present or future.

## Form
**If + past simple, would + base verb**

- **If** I **had** a million dollars, I **would buy** a yacht.
- **If** she **were** here, she **would know** what to do.

## Key Points
- The if-clause uses **past simple** (but refers to present/future, NOT past!)
- The main clause uses **would + base verb**.
- The situation is unreal, imaginary, or very unlikely.
- Use **were** (not was) with I/he/she/it in formal English: If I **were** you...

## Usage
1. **Imaginary situations:** If I **were** a bird, I **would fly** everywhere.
2. **Unlikely futures:** If I **won** the lottery, I **would quit** my job.
3. **Advice:** If I **were** you, I **would apologize**.
4. **Wishes:** If I **had** more time, I **would learn** another language.

## First vs Second Conditional
- **First (real):** If I **have** time, I **will** help you. (possible — maybe I'll have time)
- **Second (unreal):** If I **had** time, I **would** help you. (I don't have time right now)`,
      examples: JSON.stringify([
        "**If** I **were** you, I **would accept** the offer. (advice)",
        "**If** I **spoke** French, I **would move** to Paris. (imaginary)",
        "She **would travel** more **if** she **had** more vacation days. (unlikely)",
        "**If** it **were** possible, I **would go** back in time. (impossible)",
        "What **would** you do **if** you **won** the lottery? (hypothetical question)",
        "**If** he **studied** harder, he **would get** better grades. (but he doesn't study hard)"
      ]),
      tips: "If I WERE you (not 'was') — this is the subjunctive mood. In second conditional, 'were' is preferred for all subjects in formal English, though 'was' is common in informal speech. The classic advice phrase is always 'If I were you...'",
    },
  });
  for (const ex of [
    { topicId: t6_3.id, type: "multiple_choice", difficulty: "intermediate", question: "If I ___ rich, I would travel the world.", options: JSON.stringify(["am", "was", "were", "will be"]), correctAnswer: "were", explanation: "Second conditional uses past simple. With I/he/she/it, 'were' is preferred in formal English.", order: 1 },
    { topicId: t6_3.id, type: "multiple_choice", difficulty: "intermediate", question: "What ___ you do if you found a wallet on the street?", options: JSON.stringify(["will", "would", "do", "did"]), correctAnswer: "would", explanation: "Second conditional (hypothetical): if + past simple, would + base verb.", order: 2 },
    { topicId: t6_3.id, type: "multiple_choice", difficulty: "intermediate", question: "Which is second conditional?", options: JSON.stringify(["If it rains, I'll stay home.", "If it rained, I'd stay home.", "If it had rained, I would have stayed home.", "When it rains, I stay home."]), correctAnswer: "If it rained, I'd stay home.", explanation: "Second conditional: if + past simple (rained) + would + base verb ('d stay).", order: 3 },
    { topicId: t6_3.id, type: "fill_in_blank", difficulty: "intermediate", question: "If I ___ you, I would talk to the manager. (be)", correctAnswer: "were", explanation: "Second conditional advice: 'If I were you...' uses 'were' for all subjects.", order: 4 },
    { topicId: t6_3.id, type: "fill_in_blank", difficulty: "intermediate", question: "She ___ be happier if she had a better job.", correctAnswer: "would", explanation: "The main clause of second conditional uses 'would' + base verb.", order: 5 },
    { topicId: t6_3.id, type: "error_correction", difficulty: "intermediate", question: "If I would have more time, I would learn Spanish.", correctAnswer: "If I had more time, I would learn Spanish.", explanation: "Don't use 'would' in the if-clause. Use past simple: 'If I had...'", order: 6 },
    { topicId: t6_3.id, type: "error_correction", difficulty: "intermediate", question: "If I win the lottery, I would buy a house.", correctAnswer: "If I won the lottery, I would buy a house.", explanation: "Second conditional requires past simple in the if-clause: 'won' (not 'win'). Or change to first conditional: 'If I win, I will buy.'", order: 7 },
    { topicId: t6_3.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Make hypothetical: 'I don't have a car, so I take the bus.'", correctAnswer: "If I had a car, I wouldn't take the bus.|If I had a car, I would drive to work.", explanation: "Second conditional for an unreal present: If I had (but I don't), I would/wouldn't...", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 6.4: Third Conditional ---
  const t6_4 = await db.grammarTopic.create({
    data: {
      categoryId: cat6.id,
      title: "Third Conditional",
      slug: "third-conditional",
      description: "Talk about unreal situations in the past and their imagined results",
      level: "advanced",
      order: 4,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t6_4.id,
      content: `# Third Conditional

The **third conditional** talks about imaginary past situations — things that did NOT happen and their imagined results.

## Form
**If + past perfect, would have + past participle**

- **If** I **had studied** harder, I **would have passed** the exam.
  (But I didn't study hard, so I didn't pass.)

## Key Points
- Both the condition and the result are unreal/impossible (the past cannot be changed).
- If-clause: **had + past participle** (past perfect)
- Main clause: **would have + past participle**
- Used for regret, criticism, and imagining different outcomes.

## Usage
1. **Regret:** If I **had known**, I **would have come**.
2. **Criticism:** If you **had listened**, this **wouldn't have happened**.
3. **Different outcomes:** If she **had taken** the job, she **would have moved** to London.

## Variations
- **could have / might have** instead of would have:
  - If I had gone, I **could have met** her. (ability)
  - If he had left earlier, he **might have caught** the train. (possibility)

## Contractions
- If I'd known, I'd have come.
- If she'd studied, she'd have passed.`,
      examples: JSON.stringify([
        "**If** I **had known** about the party, I **would have gone**. (regret)",
        "She **would have passed** if she **had studied** more. (different outcome)",
        "**If** they **had left** earlier, they **wouldn't have missed** the flight.",
        "**If** you **had told** me, I **could have helped**. (ability)",
        "He **might have survived** if the ambulance **had arrived** sooner. (possibility)",
        "**If** I **hadn't met** you, my life **would have been** very different."
      ]),
      tips: "Third conditional is always about the PAST and always UNREAL. It's used for hindsight: 'If I had done X, Y would have happened.' The past cannot be changed, so we're just imagining a different outcome.",
    },
  });
  for (const ex of [
    { topicId: t6_4.id, type: "multiple_choice", difficulty: "advanced", question: "If I had known about the problem, I ___ you.", options: JSON.stringify(["will help", "would help", "would have helped", "helped"]), correctAnswer: "would have helped", explanation: "Third conditional: if + past perfect, would have + past participle for unreal past.", order: 1 },
    { topicId: t6_4.id, type: "multiple_choice", difficulty: "advanced", question: "If she ___ harder, she would have passed the exam.", options: JSON.stringify(["studied", "had studied", "has studied", "would study"]), correctAnswer: "had studied", explanation: "Third conditional if-clause uses past perfect: 'had studied'.", order: 2 },
    { topicId: t6_4.id, type: "multiple_choice", difficulty: "advanced", question: "Which expresses past regret?", options: JSON.stringify(["If I have time, I will go.", "If I had time, I would go.", "If I had had time, I would have gone.", "If I have time, I go."]), correctAnswer: "If I had had time, I would have gone.", explanation: "Third conditional expresses regret about an unreal past situation.", order: 3 },
    { topicId: t6_4.id, type: "fill_in_blank", difficulty: "advanced", question: "If they ___ ___ earlier, they wouldn't have missed the flight.", correctAnswer: "had left|had departed", explanation: "Third conditional if-clause: had + past participle.", order: 4 },
    { topicId: t6_4.id, type: "fill_in_blank", difficulty: "advanced", question: "I ___ ___ ___ to the concert if I had known about it.", correctAnswer: "would have gone|would have come", explanation: "Third conditional main clause: would have + past participle.", order: 5 },
    { topicId: t6_4.id, type: "error_correction", difficulty: "advanced", question: "If I would have known, I would have told you.", correctAnswer: "If I had known, I would have told you.", explanation: "Don't use 'would have' in the if-clause. Use past perfect: 'If I had known...'", order: 6 },
    { topicId: t6_4.id, type: "error_correction", difficulty: "advanced", question: "If she had studied, she would passed the exam.", correctAnswer: "If she had studied, she would have passed the exam.", explanation: "The main clause needs 'would HAVE passed', not 'would passed'.", order: 7 },
    { topicId: t6_4.id, type: "sentence_rewrite", difficulty: "advanced", question: "Express as third conditional: 'I didn't study. I failed the exam.'", correctAnswer: "If I had studied, I would have passed the exam.|If I had studied, I wouldn't have failed the exam.", explanation: "Third conditional imagines a different past: If I had done X (but I didn't), the result would have been different.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 6.5: Mixed Conditionals ---
  const t6_5 = await db.grammarTopic.create({
    data: {
      categoryId: cat6.id,
      title: "Mixed Conditionals",
      slug: "mixed-conditionals",
      description: "Combine different conditional tenses for complex unreal situations",
      level: "advanced",
      order: 5,
    },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t6_5.id,
      content: `# Mixed Conditionals

**Mixed conditionals** combine elements of different conditional types when the time in the if-clause is different from the time in the main clause.

## Type 1: Past condition → Present result
**If + past perfect, would + base verb**

The condition is about the past, but the result is about now.
- If I **had studied** medicine, I **would be** a doctor now.
  (I didn't study medicine in the past → I'm not a doctor now)

## Type 2: Present condition → Past result
**If + past simple, would have + past participle**

The condition is about a general/permanent present situation, but the result is about the past.
- If she **spoke** French, she **would have gotten** the job.
  (She doesn't speak French → she didn't get the job)

## When to Use Mixed Conditionals
- When the cause and effect span different time periods.
- When a past action affects the present, or a present state affected a past event.

## Examples of Each Type
### Past → Present
- If I **hadn't broken** my leg, I **would be playing** football now.
- If they **had saved** money, they **would own** a house now.

### Present → Past
- If I **were** braver, I **would have asked** her out.
- If he **weren't** so lazy, he **would have finished** the project.`,
      examples: JSON.stringify([
        "If I **had accepted** that job, I **would be** living in New York now. (past → present)",
        "If I **weren't** afraid of flying, I **would have traveled** more. (present → past)",
        "If she **had married** him, she **would be** unhappy now. (past → present)",
        "If he **were** more careful, he **wouldn't have had** the accident. (present → past)",
        "If I **had learned** to code, I **would have** a better job now. (past → present)",
        "If they **hadn't moved**, they **would still be** living next door. (past → present)"
      ]),
      tips: "To identify a mixed conditional, check if the time frames in the two clauses are different. If the if-clause is about the past but the result is about now (or vice versa), it's a mixed conditional. These are advanced but very natural in everyday English.",
    },
  });
  for (const ex of [
    { topicId: t6_5.id, type: "multiple_choice", difficulty: "advanced", question: "If I had studied medicine, I ___ a doctor now.", options: JSON.stringify(["would be", "would have been", "will be", "am"]), correctAnswer: "would be", explanation: "Mixed conditional (past → present): past perfect in if-clause, would + base verb for present result.", order: 1 },
    { topicId: t6_5.id, type: "multiple_choice", difficulty: "advanced", question: "If she spoke Chinese, she ___ the job last year.", options: JSON.stringify(["would get", "would have gotten", "will get", "got"]), correctAnswer: "would have gotten", explanation: "Mixed conditional (present → past): past simple in if-clause, would have + past participle for past result.", order: 2 },
    { topicId: t6_5.id, type: "multiple_choice", difficulty: "advanced", question: "Which is a mixed conditional?", options: JSON.stringify(["If I study, I will pass.", "If I studied, I would pass.", "If I had studied, I would have passed.", "If I had studied, I would be passing now."]), correctAnswer: "If I had studied, I would be passing now.", explanation: "If-clause is past (had studied), result is present (would be passing now) — different time frames.", order: 3 },
    { topicId: t6_5.id, type: "fill_in_blank", difficulty: "advanced", question: "If I ___ ___ so much coffee yesterday, I would be able to sleep now.", correctAnswer: "hadn't drunk|had not drunk|hadn't had", explanation: "Past condition (too much coffee yesterday) → present result (can't sleep now). Past perfect negative in if-clause.", order: 4 },
    { topicId: t6_5.id, type: "fill_in_blank", difficulty: "advanced", question: "If he ___ taller, he would have been accepted into the basketball team.", correctAnswer: "were|was", explanation: "Present condition (he's not tall enough — permanent) → past result (wasn't accepted). Past simple in if-clause.", order: 5 },
    { topicId: t6_5.id, type: "error_correction", difficulty: "advanced", question: "If I had saved money, I would have a car now.", correctAnswer: "If I had saved money, I would have a car now.", explanation: "This sentence is actually correct! It's a mixed conditional: past condition (didn't save) → present result (don't have a car). No correction needed — but recognizing it as correct is the exercise.", order: 6 },
    { topicId: t6_5.id, type: "error_correction", difficulty: "advanced", question: "If I would have listened to my parents, I would be happier now.", correctAnswer: "If I had listened to my parents, I would be happier now.", explanation: "Don't use 'would have' in the if-clause. Use past perfect: 'If I had listened...'", order: 7 },
    { topicId: t6_5.id, type: "sentence_rewrite", difficulty: "advanced", question: "Express as mixed conditional: 'I didn't learn to drive. I can't drive to work now.'", correctAnswer: "If I had learned to drive, I could drive to work now.|If I had learned to drive, I would be able to drive to work now.", explanation: "Past condition (didn't learn) → present result (can't drive now).", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  console.log("  Category 6: Conditionals - 5 topics seeded");

  // ============================================================
  // CATEGORY 7: Passive Voice
  // ============================================================
  const cat7 = await db.grammarCategory.create({
    data: {
      name: "Passive Voice",
      slug: "passive-voice",
      description: "Shift focus from the doer to the action or receiver",
      icon: "RotateCcw",
      order: 7,
    },
  });

  // --- Topic 7.1: Present Passive ---
  const t7_1 = await db.grammarTopic.create({
    data: { categoryId: cat7.id, title: "Present Passive", slug: "present-passive", description: "Form passive sentences in the present tense", level: "intermediate", order: 1 },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t7_1.id,
      content: `# Present Passive

The passive voice is used when the focus is on the action or the receiver, not the doer.

## Form
**Subject + am/is/are + past participle (+ by agent)**

### Present Simple Passive
- Active: They **make** cars in Germany.
- Passive: Cars **are made** in Germany.

### Present Continuous Passive
- Active: They **are building** a new school.
- Passive: A new school **is being built**.

## When to Use Passive
1. The doer is unknown: My bike **was stolen**.
2. The doer is obvious: Criminals **are punished**.
3. The action is more important than the doer: English **is spoken** worldwide.
4. Formal/scientific writing: The experiment **is conducted** daily.

## By + Agent
Include 'by' when the doer is important:
- This book **is written by** J.K. Rowling.
Omit 'by' when the doer is obvious, unknown, or unimportant.`,
      examples: JSON.stringify([
        "English **is spoken** in many countries.",
        "The office **is cleaned** every evening.",
        "A new bridge **is being built** in the city center.",
        "Coffee **is grown** in Brazil.",
        "These phones **are made** by Samsung.",
        "The letters **are being delivered** right now."
      ]),
      tips: "To change active to passive: (1) Move the object to subject position. (2) Add the correct form of 'be'. (3) Use the past participle. (4) Optionally add 'by + agent'. Active: 'They clean the office.' → Passive: 'The office is cleaned (by them).'",
    },
  });
  for (const ex of [
    { topicId: t7_1.id, type: "multiple_choice", difficulty: "intermediate", question: "Coffee ___ in Brazil.", options: JSON.stringify(["grows", "is grown", "is growing", "grown"]), correctAnswer: "is grown", explanation: "Present simple passive: is/are + past participle. Coffee is the receiver of the action.", order: 1 },
    { topicId: t7_1.id, type: "multiple_choice", difficulty: "intermediate", question: "A new hospital ___ right now.", options: JSON.stringify(["is built", "is being built", "builds", "has built"]), correctAnswer: "is being built", explanation: "Present continuous passive: is/are + being + past participle for ongoing actions.", order: 2 },
    { topicId: t7_1.id, type: "multiple_choice", difficulty: "intermediate", question: "Which is passive voice?", options: JSON.stringify(["She writes letters.", "Letters are written by her.", "She is writing letters.", "She has written letters."]), correctAnswer: "Letters are written by her.", explanation: "Passive: subject receives the action. 'Letters are written' — letters don't write, they are written.", order: 3 },
    { topicId: t7_1.id, type: "fill_in_blank", difficulty: "intermediate", question: "English ___ ___ all over the world. (speak)", correctAnswer: "is spoken", explanation: "Present simple passive: is + past participle. 'Speak' → 'spoken'.", order: 4 },
    { topicId: t7_1.id, type: "fill_in_blank", difficulty: "intermediate", question: "The rooms ___ ___ ___ at the moment. (clean)", correctAnswer: "are being cleaned", explanation: "Present continuous passive: are + being + past participle for action in progress.", order: 5 },
    { topicId: t7_1.id, type: "error_correction", difficulty: "intermediate", question: "The cake is make by my mother.", correctAnswer: "The cake is made by my mother.", explanation: "Passive requires the past participle: 'made', not the base form 'make'.", order: 6 },
    { topicId: t7_1.id, type: "error_correction", difficulty: "intermediate", question: "The building is been constructed.", correctAnswer: "The building is being constructed.", explanation: "Present continuous passive: is BEING + past participle, not 'is been'.", order: 7 },
    { topicId: t7_1.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Change to passive: 'They manufacture cars in Japan.'", correctAnswer: "Cars are manufactured in Japan.", explanation: "Move object (cars) to subject. Add 'are' + past participle (manufactured). 'By them' is omitted (unimportant).", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 7.2: Past Passive ---
  const t7_2 = await db.grammarTopic.create({
    data: { categoryId: cat7.id, title: "Past Passive", slug: "past-passive", description: "Form passive sentences in the past tense", level: "intermediate", order: 2 },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t7_2.id,
      content: `# Past Passive

## Past Simple Passive
**Subject + was/were + past participle**
- Active: Shakespeare **wrote** Hamlet.
- Passive: Hamlet **was written** by Shakespeare.

## Past Continuous Passive
**Subject + was/were + being + past participle**
- Active: They **were painting** the house.
- Passive: The house **was being painted**.

## Usage
- Describing historical events: America **was discovered** in 1492.
- News reports: The suspect **was arrested** last night.
- When the doer is unknown: My car **was stolen** yesterday.`,
      examples: JSON.stringify([
        "The Mona Lisa **was painted** by Leonardo da Vinci.",
        "The building **was destroyed** by the earthquake.",
        "Two people **were injured** in the accident.",
        "The house **was being renovated** when we arrived.",
        "The letter **was sent** yesterday.",
        "The thieves **were caught** by the police."
      ]),
      tips: "Use 'was' with singular subjects (I, he, she, it) and 'were' with plural subjects (we, you, they). The past participle stays the same regardless.",
    },
  });
  for (const ex of [
    { topicId: t7_2.id, type: "multiple_choice", difficulty: "intermediate", question: "The book ___ by Mark Twain.", options: JSON.stringify(["wrote", "was written", "is written", "has written"]), correctAnswer: "was written", explanation: "Past simple passive: was/were + past participle for completed past actions.", order: 1 },
    { topicId: t7_2.id, type: "multiple_choice", difficulty: "intermediate", question: "The road ___ when we drove through.", options: JSON.stringify(["was repaired", "was being repaired", "is being repaired", "repaired"]), correctAnswer: "was being repaired", explanation: "Past continuous passive: was/were + being + past participle for an action in progress in the past.", order: 2 },
    { topicId: t7_2.id, type: "multiple_choice", difficulty: "intermediate", question: "America ___ by Columbus in 1492.", options: JSON.stringify(["discovered", "was discovered", "is discovered", "has been discovered"]), correctAnswer: "was discovered", explanation: "Historical events in passive: was/were + past participle.", order: 3 },
    { topicId: t7_2.id, type: "fill_in_blank", difficulty: "intermediate", question: "The window ___ ___ during the storm. (break)", correctAnswer: "was broken", explanation: "Past simple passive: was + past participle. 'Break' → 'broken'.", order: 4 },
    { topicId: t7_2.id, type: "fill_in_blank", difficulty: "intermediate", question: "The suspects ___ ___ by the police last night. (arrest)", correctAnswer: "were arrested", explanation: "Plural subject (suspects) takes 'were' + past participle.", order: 5 },
    { topicId: t7_2.id, type: "error_correction", difficulty: "intermediate", question: "The pyramids was built by the ancient Egyptians.", correctAnswer: "The pyramids were built by the ancient Egyptians.", explanation: "'Pyramids' is plural, so use 'were', not 'was'.", order: 6 },
    { topicId: t7_2.id, type: "error_correction", difficulty: "intermediate", question: "The letter was wrote by my grandfather.", correctAnswer: "The letter was written by my grandfather.", explanation: "Use the past participle 'written', not the past simple 'wrote'.", order: 7 },
    { topicId: t7_2.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Change to passive: 'Someone stole my bicycle yesterday.'", correctAnswer: "My bicycle was stolen yesterday.", explanation: "Move object to subject. 'Was stolen' (past passive). 'By someone' is omitted (unknown doer).", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 7.3: Future Passive ---
  const t7_3 = await db.grammarTopic.create({
    data: { categoryId: cat7.id, title: "Future Passive", slug: "future-passive", description: "Form passive sentences about future actions", level: "intermediate", order: 3 },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t7_3.id,
      content: `# Future Passive

## Form
**Subject + will be + past participle**

- Active: They **will finish** the project tomorrow.
- Passive: The project **will be finished** tomorrow.

## Going to (Future Passive)
**Subject + am/is/are going to be + past participle**
- Active: They **are going to build** a new school.
- Passive: A new school **is going to be built**.

## Usage
- Predictions: The winner **will be announced** tonight.
- Plans: The building **is going to be demolished** next month.
- Promises: The report **will be submitted** on time.`,
      examples: JSON.stringify([
        "The results **will be announced** next week.",
        "A new airport **is going to be built** near the city.",
        "The package **will be delivered** by Friday.",
        "The meeting **will be held** in the conference room.",
        "New rules **are going to be introduced** next year.",
        "The problem **will be solved** soon."
      ]),
      tips: "Future passive with 'will': will be + past participle. Future passive with 'going to': am/is/are going to be + past participle. Both are common and correct.",
    },
  });
  for (const ex of [
    { topicId: t7_3.id, type: "multiple_choice", difficulty: "intermediate", question: "The results ___ next week.", options: JSON.stringify(["will announce", "will be announced", "are announcing", "announced"]), correctAnswer: "will be announced", explanation: "Future passive: will be + past participle.", order: 1 },
    { topicId: t7_3.id, type: "multiple_choice", difficulty: "intermediate", question: "A new school ___ in our neighborhood.", options: JSON.stringify(["is going to build", "is going to be built", "going to be built", "will build"]), correctAnswer: "is going to be built", explanation: "Future passive with 'going to': is going to be + past participle.", order: 2 },
    { topicId: t7_3.id, type: "multiple_choice", difficulty: "intermediate", question: "The letter ___ by Friday.", options: JSON.stringify(["will send", "will be sent", "is sent", "sends"]), correctAnswer: "will be sent", explanation: "Future passive: will be + past participle for a future deadline.", order: 3 },
    { topicId: t7_3.id, type: "fill_in_blank", difficulty: "intermediate", question: "The building ___ ___ ___ next month. (demolish)", correctAnswer: "will be demolished", explanation: "Future passive: will be + past participle.", order: 4 },
    { topicId: t7_3.id, type: "fill_in_blank", difficulty: "intermediate", question: "New traffic laws ___ ___ ___ ___ ___ next year. (going to / introduce)", correctAnswer: "are going to be introduced", explanation: "Future passive with 'going to': are going to be + past participle.", order: 5 },
    { topicId: t7_3.id, type: "error_correction", difficulty: "intermediate", question: "The project will finished by next week.", correctAnswer: "The project will be finished by next week.", explanation: "Future passive requires 'will BE + past participle'. Don't omit 'be'.", order: 6 },
    { topicId: t7_3.id, type: "error_correction", difficulty: "intermediate", question: "A new park is going to built in our area.", correctAnswer: "A new park is going to be built in our area.", explanation: "The structure is 'going to BE built', not 'going to built'. Don't omit 'be'.", order: 7 },
    { topicId: t7_3.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Change to passive: 'They will repair the bridge next month.'", correctAnswer: "The bridge will be repaired next month.", explanation: "Move object (bridge) to subject. Add 'will be' + past participle (repaired).", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 7.4: Perfect Passive ---
  const t7_4 = await db.grammarTopic.create({
    data: { categoryId: cat7.id, title: "Perfect Passive", slug: "perfect-passive", description: "Form passive sentences in perfect tenses", level: "advanced", order: 4 },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t7_4.id,
      content: `# Perfect Passive

## Present Perfect Passive
**Subject + have/has been + past participle**
- Active: Someone **has stolen** my wallet.
- Passive: My wallet **has been stolen**.

## Past Perfect Passive
**Subject + had been + past participle**
- Active: They **had finished** the work before we arrived.
- Passive: The work **had been finished** before we arrived.

## Usage
- Present perfect passive: The report **has been submitted**. (recent action, result matters now)
- Past perfect passive: The house **had been sold** before we could make an offer. (earlier of two past events)`,
      examples: JSON.stringify([
        "The email **has been sent**. (present perfect passive)",
        "Three people **have been arrested** in connection with the crime.",
        "The house **had been painted** before we moved in. (past perfect passive)",
        "All the tickets **have been sold** out.",
        "The homework **has already been submitted**.",
        "By the time we arrived, dinner **had been prepared**."
      ]),
      tips: "Present perfect passive is very common in formal reports and news: 'It has been reported that...' 'The building has been evacuated.' 'Three suspects have been arrested.' Practice recognizing it in news headlines.",
    },
  });
  for (const ex of [
    { topicId: t7_4.id, type: "multiple_choice", difficulty: "advanced", question: "All the tickets ___.", options: JSON.stringify(["have sold", "have been sold", "has been sold", "were selling"]), correctAnswer: "have been sold", explanation: "Present perfect passive: have/has been + past participle. 'Tickets' (plural) = 'have been sold'.", order: 1 },
    { topicId: t7_4.id, type: "multiple_choice", difficulty: "advanced", question: "By the time we arrived, the food ___.", options: JSON.stringify(["has been eaten", "had been eaten", "was eaten", "is eaten"]), correctAnswer: "had been eaten", explanation: "Past perfect passive: had been + past participle for an action completed before another past action.", order: 2 },
    { topicId: t7_4.id, type: "multiple_choice", difficulty: "advanced", question: "The report ___. You can read it now.", options: JSON.stringify(["has been completed", "had been completed", "is completed", "was completed"]), correctAnswer: "has been completed", explanation: "Present perfect passive — the report is complete now (present result of a past action).", order: 3 },
    { topicId: t7_4.id, type: "fill_in_blank", difficulty: "advanced", question: "The email ___ ___ ___. Check your inbox. (send)", correctAnswer: "has been sent", explanation: "Present perfect passive: has been + past participle.", order: 4 },
    { topicId: t7_4.id, type: "fill_in_blank", difficulty: "advanced", question: "The building ___ ___ ___ before the earthquake struck. (evacuate)", correctAnswer: "had been evacuated", explanation: "Past perfect passive: had been + past participle for the earlier of two past events.", order: 5 },
    { topicId: t7_4.id, type: "error_correction", difficulty: "advanced", question: "The homework has already been submit.", correctAnswer: "The homework has already been submitted.", explanation: "Use the past participle 'submitted', not the base form 'submit'.", order: 6 },
    { topicId: t7_4.id, type: "error_correction", difficulty: "advanced", question: "The bridge have been repaired.", correctAnswer: "The bridge has been repaired.", explanation: "'Bridge' is singular. Use 'has been', not 'have been'.", order: 7 },
    { topicId: t7_4.id, type: "sentence_rewrite", difficulty: "advanced", question: "Change to passive: 'Someone has broken the window.'", correctAnswer: "The window has been broken.", explanation: "Present perfect passive: has been + past participle. 'By someone' is omitted (unknown).", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 7.5: Modal Passive ---
  const t7_5 = await db.grammarTopic.create({
    data: { categoryId: cat7.id, title: "Modal Passive", slug: "modal-passive", description: "Combine modal verbs with passive voice", level: "advanced", order: 5 },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t7_5.id,
      content: `# Modal Passive

Modal verbs can be combined with passive voice.

## Form
**Subject + modal + be + past participle**

- Active: You **must complete** this form.
- Passive: This form **must be completed**.

## Common Modal Passives
- **can be:** This problem **can be solved**.
- **could be:** The meeting **could be postponed**.
- **should be:** Homework **should be submitted** on time.
- **must be:** Seatbelts **must be worn** at all times.
- **may be:** The flight **may be delayed**.
- **might be:** The event **might be cancelled**.
- **will be:** The winner **will be announced** tonight.
- **have to be:** The rules **have to be followed**.

## Past Modal Passive
**Subject + modal + have been + past participle**
- The letter **should have been sent** yesterday. (but it wasn't)
- The work **could have been done** better. (but it wasn't)`,
      examples: JSON.stringify([
        "This door **must be kept** closed at all times.",
        "The report **should be finished** by Friday.",
        "Mistakes **can be corrected** easily.",
        "The package **might be delivered** tomorrow.",
        "This homework **should have been submitted** yesterday.",
        "The building **could have been saved** if firefighters had arrived sooner."
      ]),
      tips: "Modal passive is very common in rules, instructions, and formal writing: 'Phones must be switched off.' 'Applications should be submitted by March 1st.' 'Parking is not permitted.' (= cannot be done)",
    },
  });
  for (const ex of [
    { topicId: t7_5.id, type: "multiple_choice", difficulty: "advanced", question: "This form ___ in black ink.", options: JSON.stringify(["must fill", "must be filled", "must be fill", "must filling"]), correctAnswer: "must be filled", explanation: "Modal passive: must + be + past participle.", order: 1 },
    { topicId: t7_5.id, type: "multiple_choice", difficulty: "advanced", question: "The homework ___ yesterday, but it wasn't.", options: JSON.stringify(["should submit", "should be submitted", "should have been submitted", "should been submitted"]), correctAnswer: "should have been submitted", explanation: "Past modal passive: should + have been + past participle (for something that didn't happen but should have).", order: 2 },
    { topicId: t7_5.id, type: "multiple_choice", difficulty: "advanced", question: "Mistakes ___ easily.", options: JSON.stringify(["can correct", "can be corrected", "can corrected", "can being corrected"]), correctAnswer: "can be corrected", explanation: "Modal passive: can + be + past participle.", order: 3 },
    { topicId: t7_5.id, type: "fill_in_blank", difficulty: "advanced", question: "Food and drinks ___ ___ ___ into the library. (must not / bring)", correctAnswer: "must not be brought", explanation: "Negative modal passive: must not + be + past participle.", order: 4 },
    { topicId: t7_5.id, type: "fill_in_blank", difficulty: "advanced", question: "The project ___ ___ ___ ___ last week. (should / complete)", correctAnswer: "should have been completed", explanation: "Past modal passive expressing criticism: should have been + past participle.", order: 5 },
    { topicId: t7_5.id, type: "error_correction", difficulty: "advanced", question: "The work must completed by Friday.", correctAnswer: "The work must be completed by Friday.", explanation: "Modal passive requires 'be': must BE completed, not 'must completed'.", order: 6 },
    { topicId: t7_5.id, type: "error_correction", difficulty: "advanced", question: "This problem can solved easily.", correctAnswer: "This problem can be solved easily.", explanation: "Don't omit 'be' in modal passive: can BE solved.", order: 7 },
    { topicId: t7_5.id, type: "sentence_rewrite", difficulty: "advanced", question: "Change to passive: 'You must wear a helmet on the construction site.'", correctAnswer: "A helmet must be worn on the construction site.|Helmets must be worn on the construction site.", explanation: "Modal passive: must be + past participle. Focus shifts from 'you' to the rule about helmets.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  console.log("  Category 7: Passive Voice - 5 topics seeded");

  // ============================================================
  // CATEGORY 8: Reported Speech
  // ============================================================
  const cat8 = await db.grammarCategory.create({
    data: {
      name: "Reported Speech",
      slug: "reported-speech",
      description: "Report what someone else said without quoting them directly",
      icon: "Quote",
      order: 8,
    },
  });

  // --- Topic 8.1: Reported Statements ---
  const t8_1 = await db.grammarTopic.create({
    data: { categoryId: cat8.id, title: "Reported Statements", slug: "reported-statements", description: "Report what someone said using indirect speech", level: "intermediate", order: 1 },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t8_1.id,
      content: `# Reported Statements

**Reported speech** (indirect speech) tells what someone said without using their exact words.

## Form
**Subject + said (that) + reported clause**

- Direct: "I am tired," she said.
- Reported: She said (that) she **was** tired.

## Tense Shifts
When the reporting verb is past (said, told), tenses shift back:
- Present simple → Past simple: "I **like** coffee" → She said she **liked** coffee.
- Present continuous → Past continuous: "I **am working**" → He said he **was working**.
- Present perfect → Past perfect: "I **have finished**" → She said she **had finished**.
- Past simple → Past perfect: "I **went**" → He said he **had gone**.
- Will → Would: "I **will help**" → She said she **would help**.
- Can → Could: "I **can** swim" → He said he **could** swim.

## Pronoun and Time/Place Changes
- I → he/she, we → they, my → his/her
- today → that day, tomorrow → the next day, yesterday → the day before
- here → there, this → that, now → then

## 'Say' vs 'Tell'
- **Say** (no person after it): She **said** she was tired.
- **Tell** (needs a person): She **told me** she was tired.`,
      examples: JSON.stringify([
        "\"I am happy.\" → She said she **was** happy.",
        "\"I will call you.\" → He said he **would** call me.",
        "\"We have finished.\" → They said they **had** finished.",
        "\"I can't come today.\" → She said she **couldn't** come **that day**.",
        "He **told** me he was leaving the next day.",
        "\"I bought a car yesterday.\" → She said she **had bought** a car **the day before**."
      ]),
      tips: "Remember: 'said' stands alone, 'told' needs an object. Say: She said (that) she was tired. Tell: She told me (that) she was tired. Never say 'She said me' or 'She told that she was tired.'",
    },
  });
  for (const ex of [
    { topicId: t8_1.id, type: "multiple_choice", difficulty: "intermediate", question: "\"I am tired.\" → She said she ___ tired.", options: JSON.stringify(["is", "was", "has been", "will be"]), correctAnswer: "was", explanation: "Present simple 'am' shifts to past simple 'was' in reported speech.", order: 1 },
    { topicId: t8_1.id, type: "multiple_choice", difficulty: "intermediate", question: "\"I will help you.\" → He said he ___ help me.", options: JSON.stringify(["will", "would", "can", "should"]), correctAnswer: "would", explanation: "'Will' shifts to 'would' in reported speech.", order: 2 },
    { topicId: t8_1.id, type: "multiple_choice", difficulty: "intermediate", question: "Which is correct?", options: JSON.stringify(["She said me she was tired.", "She told that she was tired.", "She told me she was tired.", "She said to me that tired."]), correctAnswer: "She told me she was tired.", explanation: "'Tell' requires a person object: 'told me'. 'Say' does not: 'said (that)...'", order: 3 },
    { topicId: t8_1.id, type: "fill_in_blank", difficulty: "intermediate", question: "\"I have finished my homework.\" → She said she ___ ___ her homework.", correctAnswer: "had finished", explanation: "Present perfect 'have finished' shifts to past perfect 'had finished'.", order: 4 },
    { topicId: t8_1.id, type: "fill_in_blank", difficulty: "intermediate", question: "\"I bought a car yesterday.\" → He said he ___ ___ a car the day before.", correctAnswer: "had bought", explanation: "Past simple 'bought' shifts to past perfect 'had bought'. 'Yesterday' → 'the day before'.", order: 5 },
    { topicId: t8_1.id, type: "error_correction", difficulty: "intermediate", question: "She said me that she was happy.", correctAnswer: "She said that she was happy.", explanation: "'Said' does not take a person object. Use 'said that' or 'told me that'.", order: 6 },
    { topicId: t8_1.id, type: "error_correction", difficulty: "intermediate", question: "He told that he will come tomorrow.", correctAnswer: "He said that he would come the next day.", explanation: "'Told' needs a person object, or use 'said'. Also: 'will' → 'would', 'tomorrow' → 'the next day'.", order: 7 },
    { topicId: t8_1.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Report: \"I am studying English.\" (she said)", correctAnswer: "She said she was studying English.|She said that she was studying English.", explanation: "'I am studying' → 'she was studying'. Present continuous shifts to past continuous.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 8.2: Reported Questions ---
  const t8_2 = await db.grammarTopic.create({
    data: { categoryId: cat8.id, title: "Reported Questions", slug: "reported-questions", description: "Report questions using indirect speech", level: "intermediate", order: 2 },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t8_2.id,
      content: `# Reported Questions

When reporting questions, change the word order to statement order and apply tense shifts.

## Yes/No Questions
Use **if** or **whether** + statement order:
- Direct: "Do you like coffee?"
- Reported: She asked (me) **if/whether** I **liked** coffee.

## WH-Questions
Keep the question word + statement order:
- Direct: "Where do you live?"
- Reported: He asked (me) **where** I **lived**.

## Key Rules
1. **No question mark** in reported questions.
2. **Statement word order** (subject before verb): He asked where I lived (NOT where did I live).
3. **No do/does/did** in the reported clause.
4. Same tense shifts as reported statements.

## Reporting Verbs for Questions
- asked, wanted to know, inquired, wondered`,
      examples: JSON.stringify([
        "\"Do you speak English?\" → She asked me **if** I **spoke** English.",
        "\"Where is the station?\" → He asked **where** the station **was**.",
        "\"Have you ever been to Paris?\" → She asked me **whether** I **had** ever **been** to Paris.",
        "\"What time does the train leave?\" → He wanted to know **what time** the train **left**.",
        "\"Can you help me?\" → She asked **if** I **could** help her.",
        "\"Why are you crying?\" → He asked me **why** I **was** crying."
      ]),
      tips: "The most common mistake is keeping question word order. Remember: reported questions use STATEMENT order. Say 'He asked where I lived' NOT 'He asked where did I live.' No question marks in reported questions!",
    },
  });
  for (const ex of [
    { topicId: t8_2.id, type: "multiple_choice", difficulty: "intermediate", question: "\"Where do you live?\" → She asked me ___.", options: JSON.stringify(["where do I live", "where I lived", "where did I live", "where I live"]), correctAnswer: "where I lived", explanation: "Reported questions use statement order + tense shift: 'where I lived'.", order: 1 },
    { topicId: t8_2.id, type: "multiple_choice", difficulty: "intermediate", question: "\"Do you like pizza?\" → He asked me ___.", options: JSON.stringify(["do I like pizza", "if I liked pizza", "if did I like pizza", "that I liked pizza"]), correctAnswer: "if I liked pizza", explanation: "Yes/No questions use 'if/whether' + statement order + tense shift.", order: 2 },
    { topicId: t8_2.id, type: "multiple_choice", difficulty: "intermediate", question: "\"Can you swim?\" → She asked me ___.", options: JSON.stringify(["can I swim", "if I can swim", "if I could swim", "whether can I swim"]), correctAnswer: "if I could swim", explanation: "'Can' shifts to 'could'. Use 'if/whether' + statement order.", order: 3 },
    { topicId: t8_2.id, type: "fill_in_blank", difficulty: "intermediate", question: "\"What time is it?\" → He asked ___ ___ ___ ___.", correctAnswer: "what time it was", explanation: "Reported WH-question: question word + statement order + tense shift.", order: 4 },
    { topicId: t8_2.id, type: "fill_in_blank", difficulty: "intermediate", question: "\"Have you finished?\" → She asked me ___ I ___ finished.", correctAnswer: "if ... had|whether ... had", explanation: "Yes/No → if/whether. 'Have finished' shifts to 'had finished'.", order: 5 },
    { topicId: t8_2.id, type: "error_correction", difficulty: "intermediate", question: "He asked me where did I work.", correctAnswer: "He asked me where I worked.", explanation: "Reported questions use statement order: 'where I worked', not 'where did I work'.", order: 6 },
    { topicId: t8_2.id, type: "error_correction", difficulty: "intermediate", question: "She asked me that if I was happy.", correctAnswer: "She asked me if I was happy.", explanation: "Don't use 'that' and 'if' together. Use either 'asked that' (statements only) or 'asked if' (questions).", order: 7 },
    { topicId: t8_2.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Report: \"Why are you late?\" (the teacher asked me)", correctAnswer: "The teacher asked me why I was late.", explanation: "WH-question word + statement order + tense shift: 'why I was late'.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 8.3: Reported Commands ---
  const t8_3 = await db.grammarTopic.create({
    data: { categoryId: cat8.id, title: "Reported Commands", slug: "reported-commands", description: "Report commands, requests, and advice in indirect speech", level: "intermediate", order: 3 },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t8_3.id,
      content: `# Reported Commands

Commands, requests, and advice are reported using **infinitive (to + verb)**.

## Form
**Subject + told/asked/ordered + object + (not) to + base verb**

### Affirmative Commands
- Direct: "Sit down," the teacher said.
- Reported: The teacher **told** us **to sit** down.

### Negative Commands
- Direct: "Don't be late," she said.
- Reported: She **told** me **not to be** late.

## Reporting Verbs
- **told** (general commands): She told me to wait.
- **asked** (polite requests): She asked me to help.
- **ordered** (strong commands): The officer ordered them to stop.
- **advised** (advice): The doctor advised me to rest.
- **warned** (warnings): She warned me not to touch it.
- **encouraged** (encouragement): He encouraged me to try again.
- **begged** (desperate requests): She begged me not to leave.
- **reminded** (reminders): He reminded me to bring my book.`,
      examples: JSON.stringify([
        "\"Stop talking!\" → The teacher **told** us **to stop** talking.",
        "\"Please help me.\" → She **asked** me **to help** her.",
        "\"Don't touch that!\" → He **warned** me **not to touch** that.",
        "\"You should see a doctor.\" → She **advised** me **to see** a doctor.",
        "\"Please don't leave.\" → She **begged** me **not to leave**.",
        "\"Don't forget your passport.\" → He **reminded** me **not to forget** my passport."
      ]),
      tips: "Choose your reporting verb carefully — it changes the tone: 'told' is neutral, 'ordered' is strong, 'asked' is polite, 'begged' is desperate, 'warned' adds urgency. The right verb makes your reported speech more precise.",
    },
  });
  for (const ex of [
    { topicId: t8_3.id, type: "multiple_choice", difficulty: "intermediate", question: "\"Close the door.\" → She told me ___.", options: JSON.stringify(["close the door", "to close the door", "that close the door", "closing the door"]), correctAnswer: "to close the door", explanation: "Reported commands use: told + object + to + base verb.", order: 1 },
    { topicId: t8_3.id, type: "multiple_choice", difficulty: "intermediate", question: "\"Don't run!\" → The teacher told the students ___.", options: JSON.stringify(["don't run", "to not run", "not to run", "to don't run"]), correctAnswer: "not to run", explanation: "Negative reported commands: told + object + NOT to + base verb.", order: 2 },
    { topicId: t8_3.id, type: "multiple_choice", difficulty: "intermediate", question: "\"Please help me.\" → She ___ me to help her.", options: JSON.stringify(["said", "told", "asked", "spoke"]), correctAnswer: "asked", explanation: "'Asked' is used for polite requests. 'Please' in the original suggests politeness.", order: 3 },
    { topicId: t8_3.id, type: "fill_in_blank", difficulty: "intermediate", question: "\"You should exercise more.\" → The doctor ___ me ___ exercise more.", correctAnswer: "advised ... to", explanation: "'You should' is advice. Use 'advised + object + to + verb'.", order: 4 },
    { topicId: t8_3.id, type: "fill_in_blank", difficulty: "intermediate", question: "\"Don't forget your keys!\" → She ___ me ___ ___ forget my keys.", correctAnswer: "reminded ... not to", explanation: "Reported reminder with negative: reminded + object + not to + verb.", order: 5 },
    { topicId: t8_3.id, type: "error_correction", difficulty: "intermediate", question: "She told me don't worry.", correctAnswer: "She told me not to worry.", explanation: "Reported negative commands use 'not to + verb', not 'don't + verb'.", order: 6 },
    { topicId: t8_3.id, type: "error_correction", difficulty: "intermediate", question: "He asked to me help him.", correctAnswer: "He asked me to help him.", explanation: "'Asked' takes a direct object without 'to': 'asked me', not 'asked to me'.", order: 7 },
    { topicId: t8_3.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Report: \"Don't eat junk food,\" the doctor said to me.", correctAnswer: "The doctor advised me not to eat junk food.|The doctor told me not to eat junk food.", explanation: "Report using 'advised/told' + object + not to + verb for negative commands from a doctor.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  // --- Topic 8.4: Tense Shifts in Reported Speech ---
  const t8_4 = await db.grammarTopic.create({
    data: { categoryId: cat8.id, title: "Tense Shifts in Reported Speech", slug: "tense-shifts-reported-speech", description: "Master the tense changes when converting direct to indirect speech", level: "advanced", order: 4 },
  });
  await db.grammarLesson.create({
    data: {
      topicId: t8_4.id,
      content: `# Tense Shifts in Reported Speech

When the reporting verb is in the past tense (said, told), the tenses in the reported clause typically shift back one step.

## Complete Tense Shift Table
| Direct Speech | Reported Speech |
|---|---|
| Present simple (I **work**) | Past simple (he **worked**) |
| Present continuous (I **am working**) | Past continuous (he **was working**) |
| Present perfect (I **have worked**) | Past perfect (he **had worked**) |
| Past simple (I **worked**) | Past perfect (he **had worked**) |
| Past continuous (I **was working**) | Past perfect continuous (he **had been working**) |
| Will | Would |
| Can | Could |
| May | Might |
| Must (obligation) | Had to |
| Must (deduction) | Must (no change) |

## When NOT to Shift Tenses
1. **General truths/facts:** "The Earth is round." → She said the Earth **is** round. (still true)
2. **Reporting verb in present tense:** She **says** she is happy. (no shift needed)
3. **Past perfect:** No further shift possible. It stays past perfect.
4. **Would, could, should, might, ought to:** These don't change.

## Other Changes
- this → that, these → those
- here → there, now → then
- today → that day, tonight → that night
- yesterday → the day before / the previous day
- tomorrow → the next day / the following day
- last week → the previous week / the week before
- next week → the following week`,
      examples: JSON.stringify([
        "\"I **work** here.\" → He said he **worked** there. (present → past, here → there)",
        "\"I **am leaving** tomorrow.\" → She said she **was leaving** the next day.",
        "\"I **have seen** that movie.\" → He said he **had seen** that movie.",
        "\"I **will call** you.\" → She said she **would** call me.",
        "\"I **can** swim.\" → He said he **could** swim.",
        "\"The sun **rises** in the east.\" → She said the sun **rises** in the east. (general truth — no shift)"
      ]),
      tips: "Think of tense shifts as 'stepping back in time.' Each tense moves one step into the past. The exception: past perfect can't go further back, so it stays the same. And general truths (scientific facts, ongoing situations) don't need to shift.",
    },
  });
  for (const ex of [
    { topicId: t8_4.id, type: "multiple_choice", difficulty: "advanced", question: "\"I was sleeping.\" → She said she ___.", options: JSON.stringify(["was sleeping", "had been sleeping", "is sleeping", "has been sleeping"]), correctAnswer: "had been sleeping", explanation: "Past continuous shifts to past perfect continuous in reported speech.", order: 1 },
    { topicId: t8_4.id, type: "multiple_choice", difficulty: "advanced", question: "\"I must go.\" → He said he ___ go.", options: JSON.stringify(["must", "had to", "has to", "would"]), correctAnswer: "had to", explanation: "'Must' (obligation) shifts to 'had to' in reported speech.", order: 2 },
    { topicId: t8_4.id, type: "multiple_choice", difficulty: "advanced", question: "Which does NOT require a tense shift?", options: JSON.stringify(["\"I like pizza.\"", "\"Water boils at 100°C.\"", "\"I went to the store.\"", "\"I am tired.\""]), correctAnswer: "\"Water boils at 100°C.\"", explanation: "General/scientific truths don't require tense shifts: She said water boils at 100°C.", order: 3 },
    { topicId: t8_4.id, type: "fill_in_blank", difficulty: "advanced", question: "\"I can swim.\" → He said he ___ swim.", correctAnswer: "could", explanation: "'Can' shifts to 'could' in reported speech.", order: 4 },
    { topicId: t8_4.id, type: "fill_in_blank", difficulty: "advanced", question: "\"I will meet you tomorrow.\" → She said she ___ meet me ___.", correctAnswer: "would ... the next day|would ... the following day", explanation: "'Will' → 'would', 'tomorrow' → 'the next day/the following day'.", order: 5 },
    { topicId: t8_4.id, type: "error_correction", difficulty: "advanced", question: "He said he can speak French.", correctAnswer: "He said he could speak French.", explanation: "When the reporting verb is past ('said'), 'can' shifts to 'could'.", order: 6 },
    { topicId: t8_4.id, type: "error_correction", difficulty: "advanced", question: "She said she will come yesterday.", correctAnswer: "She said she would come the day before.", explanation: "'Will' shifts to 'would'. 'Yesterday' shifts to 'the day before' in reported speech.", order: 7 },
    { topicId: t8_4.id, type: "sentence_rewrite", difficulty: "advanced", question: "Report all shifts: \"I am reading a book now,\" she said.", correctAnswer: "She said she was reading a book then.|She said that she was reading a book then.", explanation: "'I am reading' → 'she was reading' (present continuous → past continuous). 'Now' → 'then'.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  console.log("  Category 8: Reported Speech - 4 topics seeded");

  // ============================================================
  // CATEGORY 9: Articles & Determiners
  // ============================================================
  const cat9 = await db.grammarCategory.create({
    data: { name: "Articles & Determiners", slug: "articles-and-determiners", description: "Master the use of articles and determiners before nouns", icon: "Hash", order: 9 },
  });

  const t9_1 = await db.grammarTopic.create({ data: { categoryId: cat9.id, title: "A/An/The", slug: "a-an-the", description: "Master the definite and indefinite articles", level: "beginner", order: 1 } });
  await db.grammarLesson.create({ data: { topicId: t9_1.id, content: `# A / An / The

## Indefinite Articles: A / An
Used with singular countable nouns when we mention something for the first time or talk about something non-specific.
- **a** before consonant sounds: a car, a university (yoo-), a European
- **an** before vowel sounds: an apple, an hour (silent h), an MBA

## Definite Article: The
Used when the noun is specific, unique, or already mentioned.
- Second mention: I saw **a** dog. **The** dog was brown.
- Unique things: **the** sun, **the** Internet, **the** government
- Superlatives: **the** best, **the** tallest
- With of-phrases: **the** capital of Turkey
- Oceans/rivers/mountain ranges: **the** Pacific, **the** Nile, **the** Alps

## Zero Article (no article)
- Plural/uncountable nouns (general): **Dogs** are loyal. **Water** is essential.
- Most proper nouns: **Istanbul**, **Turkey**, **Mount Everest**
- Meals, sports, languages: **breakfast**, **football**, **English**
- Abstract nouns (general): **Love** is beautiful.

## Special Cases
- go to **school/work/bed/church** (general purpose) vs go to **the** school (the building)
- in **hospital** (as a patient) vs in **the** hospital (the building)
- play **the** piano/guitar (instruments use 'the')`, examples: JSON.stringify(["I saw **a** movie last night. **The** movie was fantastic.", "She is **an** honest person. (silent h)", "**The** Eiffel Tower is in Paris.", "I love **music**. (general — no article)", "He plays **the** guitar. (instruments use 'the')", "She goes to **school** at 8 AM. (general purpose)"]), tips: "The #1 rule: use A/AN based on SOUND, not spelling. 'A university' (yoo-sound) but 'an umbrella' (uh-sound). 'An hour' (silent h) but 'a hotel' (h-sound)." } });
  for (const ex of [
    { topicId: t9_1.id, type: "multiple_choice", difficulty: "beginner", question: "She is ___ European tourist.", options: JSON.stringify(["a", "an", "the", "no article"]), correctAnswer: "a", explanation: "'European' starts with a 'yoo' consonant sound, so use 'a', not 'an'.", order: 1 },
    { topicId: t9_1.id, type: "multiple_choice", difficulty: "beginner", question: "I bought ___ apple and ___ banana.", options: JSON.stringify(["a / a", "an / a", "the / the", "an / an"]), correctAnswer: "an / a", explanation: "'Apple' starts with a vowel sound → 'an'. 'Banana' starts with a consonant → 'a'.", order: 2 },
    { topicId: t9_1.id, type: "multiple_choice", difficulty: "beginner", question: "Which needs 'the'?", options: JSON.stringify(["___ dogs are loyal.", "___ sun is bright today.", "___ love is beautiful.", "___ coffee is popular."]), correctAnswer: "___ sun is bright today.", explanation: "The sun is unique — there is only one. Unique objects use 'the'.", order: 3 },
    { topicId: t9_1.id, type: "fill_in_blank", difficulty: "beginner", question: "He plays ___ piano beautifully.", correctAnswer: "the", explanation: "Musical instruments use 'the': play the piano, the guitar, the violin.", order: 4 },
    { topicId: t9_1.id, type: "fill_in_blank", difficulty: "beginner", question: "I need ___ hour to finish this work.", correctAnswer: "an", explanation: "'Hour' has a silent 'h', so the sound starts with a vowel 'ow'. Use 'an'.", order: 5 },
    { topicId: t9_1.id, type: "error_correction", difficulty: "beginner", question: "She is a honest woman.", correctAnswer: "She is an honest woman.", explanation: "'Honest' has a silent 'h'. The word starts with an 'o' vowel sound, so use 'an'.", order: 6 },
    { topicId: t9_1.id, type: "error_correction", difficulty: "beginner", question: "I love the music. It makes me relax.", correctAnswer: "I love music. It makes me relax.", explanation: "When talking about music in general (not specific music), no article is needed.", order: 7 },
    { topicId: t9_1.id, type: "sentence_rewrite", difficulty: "beginner", question: "Add articles: 'I saw cat in garden. Cat was black.'", correctAnswer: "I saw a cat in the garden. The cat was black.|I saw a cat in a garden. The cat was black.", explanation: "First mention: 'a cat'. Second mention: 'the cat' (now specific).", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  const t9_2 = await db.grammarTopic.create({ data: { categoryId: cat9.id, title: "Some & Any", slug: "some-and-any", description: "Use some and any correctly with countable and uncountable nouns", level: "beginner", order: 2 } });
  await db.grammarLesson.create({ data: { topicId: t9_2.id, content: `# Some & Any

## Some
Used in **affirmative sentences** with both countable (plural) and uncountable nouns.
- I need **some** water. (uncountable)
- There are **some** books on the table. (countable plural)
- Also used in **offers and requests**: Would you like **some** coffee? Can I have **some** sugar?

## Any
Used in **negative sentences and questions**.
- I don't have **any** money. (negative)
- Are there **any** questions? (question)
- **Any** = it doesn't matter which: You can sit in **any** seat.

## Compounds
- **some**one, **some**thing, **some**where, **some**body (affirmative)
- **any**one, **any**thing, **any**where, **any**body (negative / questions)
- **no** one, **no**thing, **no**where, **no**body (negative meaning with positive verb)`, examples: JSON.stringify(["I bought **some** fruit at the market.", "There aren't **any** eggs in the fridge.", "Would you like **some** tea? (offer)", "Is there **anyone** at the door?", "She didn't say **anything**.", "**Nobody** came to the party."]), tips: "Use 'some' in offers and requests even though they are questions: 'Would you like some coffee?' 'Can I have some water?' This is because you expect the answer to be 'yes'." } });
  for (const ex of [
    { topicId: t9_2.id, type: "multiple_choice", difficulty: "beginner", question: "I don't have ___ milk.", options: JSON.stringify(["some", "any", "a", "many"]), correctAnswer: "any", explanation: "Use 'any' in negative sentences: don't have any.", order: 1 },
    { topicId: t9_2.id, type: "multiple_choice", difficulty: "beginner", question: "Would you like ___ coffee?", options: JSON.stringify(["any", "some", "a", "the"]), correctAnswer: "some", explanation: "Use 'some' in offers and requests, even though this is a question.", order: 2 },
    { topicId: t9_2.id, type: "multiple_choice", difficulty: "beginner", question: "There is ___ wrong with the computer.", options: JSON.stringify(["anything", "something", "nothing", "everything"]), correctAnswer: "something", explanation: "This is an affirmative statement, so use 'something'.", order: 3 },
    { topicId: t9_2.id, type: "fill_in_blank", difficulty: "beginner", question: "Are there ___ students absent today?", correctAnswer: "any", explanation: "'Any' is used in questions with countable plural nouns.", order: 4 },
    { topicId: t9_2.id, type: "fill_in_blank", difficulty: "beginner", question: "She bought ___ flowers for her mother.", correctAnswer: "some", explanation: "'Some' is used in affirmative sentences with plural countable nouns.", order: 5 },
    { topicId: t9_2.id, type: "error_correction", difficulty: "beginner", question: "I don't have some money.", correctAnswer: "I don't have any money.", explanation: "In negative sentences, use 'any', not 'some'.", order: 6 },
    { topicId: t9_2.id, type: "error_correction", difficulty: "beginner", question: "Is there something in the box? I can't see.", correctAnswer: "Is there anything in the box? I can't see.", explanation: "In questions (when you don't know/expect yes), use 'anything'.", order: 7 },
    { topicId: t9_2.id, type: "sentence_rewrite", difficulty: "beginner", question: "Make negative: 'There are some cookies in the jar.'", correctAnswer: "There aren't any cookies in the jar.|There are no cookies in the jar.", explanation: "'Some' changes to 'any' in negative, or use 'no' with a positive verb.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  const t9_3 = await db.grammarTopic.create({ data: { categoryId: cat9.id, title: "Much/Many/A lot of", slug: "much-many-a-lot-of", description: "Express quantity with countable and uncountable nouns", level: "beginner", order: 3 } });
  await db.grammarLesson.create({ data: { topicId: t9_3.id, content: `# Much / Many / A lot of

## Much
Used with **uncountable nouns**, usually in negative and question forms.
- I don't have **much** time.
- How **much** money do you need?

## Many
Used with **countable plural nouns**, in all sentence types.
- She has **many** friends.
- How **many** books did you read?

## A lot of / Lots of
Used with **both countable and uncountable** nouns, mainly in affirmative sentences.
- She has **a lot of** friends. (countable)
- There is **a lot of** traffic. (uncountable)

## Summary
| | Countable | Uncountable |
|---|---|---|
| Affirmative | many / a lot of | much / a lot of |
| Negative | many / a lot of | much / a lot of |
| Questions | how many | how much |`, examples: JSON.stringify(["She doesn't have **much** experience.", "How **many** languages do you speak?", "There are **a lot of** people in the park.", "He has **a lot of** patience. (uncountable)", "I don't eat **much** sugar.", "There aren't **many** shops in this area."]), tips: "In everyday spoken English, 'a lot of' is more natural in affirmative sentences. 'Much' and 'many' sound more natural in negatives and questions. 'I have a lot of work' sounds better than 'I have much work' in conversation." } });
  for (const ex of [
    { topicId: t9_3.id, type: "multiple_choice", difficulty: "beginner", question: "How ___ sugar do you want?", options: JSON.stringify(["many", "much", "lot", "a lot"]), correctAnswer: "much", explanation: "'Sugar' is uncountable. Use 'how much' with uncountable nouns.", order: 1 },
    { topicId: t9_3.id, type: "multiple_choice", difficulty: "beginner", question: "She has ___ books in her library.", options: JSON.stringify(["much", "many", "a", "any"]), correctAnswer: "many", explanation: "'Books' is countable plural. Use 'many' (or 'a lot of').", order: 2 },
    { topicId: t9_3.id, type: "multiple_choice", difficulty: "beginner", question: "There is ___ traffic today.", options: JSON.stringify(["many", "much", "a lot of", "several"]), correctAnswer: "a lot of", explanation: "'Traffic' is uncountable. In affirmative sentences, 'a lot of' is most natural.", order: 3 },
    { topicId: t9_3.id, type: "fill_in_blank", difficulty: "beginner", question: "How ___ students are in your class?", correctAnswer: "many", explanation: "'Students' is countable. Use 'how many' with countable nouns.", order: 4 },
    { topicId: t9_3.id, type: "fill_in_blank", difficulty: "beginner", question: "I don't have ___ time left.", correctAnswer: "much", explanation: "'Time' is uncountable. In negative sentences, 'much' is common.", order: 5 },
    { topicId: t9_3.id, type: "error_correction", difficulty: "beginner", question: "How much friends do you have?", correctAnswer: "How many friends do you have?", explanation: "'Friends' is countable. Use 'how many', not 'how much'.", order: 6 },
    { topicId: t9_3.id, type: "error_correction", difficulty: "beginner", question: "She has much books at home.", correctAnswer: "She has many books at home.", explanation: "'Books' is countable. Use 'many' or 'a lot of', not 'much'.", order: 7 },
    { topicId: t9_3.id, type: "sentence_rewrite", difficulty: "beginner", question: "Rewrite using 'a lot of': 'He has many responsibilities at work.'", correctAnswer: "He has a lot of responsibilities at work.", explanation: "'A lot of' can replace 'many' with countable plural nouns.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  const t9_4 = await db.grammarTopic.create({ data: { categoryId: cat9.id, title: "Few & Little", slug: "few-and-little", description: "Express small quantities with positive and negative meaning", level: "intermediate", order: 4 } });
  await db.grammarLesson.create({ data: { topicId: t9_4.id, content: `# Few & Little

## Few (countable)
- **Few** = not many (negative meaning): **Few** people came. (disappointing — not enough)
- **A few** = some, enough (positive meaning): **A few** people came. (satisfactory — some came)

## Little (uncountable)
- **Little** = not much (negative meaning): There is **little** hope. (almost none)
- **A little** = some, enough (positive meaning): There is **a little** hope. (some hope exists)

## Summary
| | Countable | Uncountable |
|---|---|---|
| Positive (some) | a few | a little |
| Negative (not enough) | few | little |

The difference between "few/little" and "a few/a little" is just the article "a" — but it completely changes the meaning!`, examples: JSON.stringify(["**Few** students passed the exam. (not many — negative)", "**A few** students passed the exam. (some — positive)", "There is **little** milk left. (almost none — negative)", "There is **a little** milk left. (some — positive)", "He has **few** friends. (not enough — he's lonely)", "He has **a few** friends. (some — he's not alone)"]), tips: "Think of 'a' as making it positive: 'a few' = positive (some), 'few' = negative (not enough). Same with 'a little' (some) vs 'little' (not enough). This small difference in meaning is tested very often!" } });
  for (const ex of [
    { topicId: t9_4.id, type: "multiple_choice", difficulty: "intermediate", question: "There is ___ water left. We need to buy more.", options: JSON.stringify(["a little", "little", "few", "a few"]), correctAnswer: "little", explanation: "'Little' (without 'a') means 'not enough'. We need more water, so the quantity is insufficient.", order: 1 },
    { topicId: t9_4.id, type: "multiple_choice", difficulty: "intermediate", question: "I have ___ friends in this city, so I'm not completely alone.", options: JSON.stringify(["few", "a few", "little", "a little"]), correctAnswer: "a few", explanation: "'A few' = some (positive). The person has some friends and is not alone.", order: 2 },
    { topicId: t9_4.id, type: "multiple_choice", difficulty: "intermediate", question: "Which has a negative meaning?", options: JSON.stringify(["a few students", "few students", "a little money", "some students"]), correctAnswer: "few students", explanation: "'Few' (without 'a') = not many, negative meaning (disappointing number).", order: 3 },
    { topicId: t9_4.id, type: "fill_in_blank", difficulty: "intermediate", question: "There is ___ ___ sugar in the bowl. You can use it.", correctAnswer: "a little", explanation: "'A little' = some (positive). You can use it means there's enough.", order: 4 },
    { topicId: t9_4.id, type: "fill_in_blank", difficulty: "intermediate", question: "___ people understand this concept. It's very complex.", correctAnswer: "Few", explanation: "'Few' = not many (negative). The concept is hard, so very few understand it.", order: 5 },
    { topicId: t9_4.id, type: "error_correction", difficulty: "intermediate", question: "I have few money in my wallet.", correctAnswer: "I have little money in my wallet.", explanation: "'Money' is uncountable. Use 'little/a little', not 'few/a few'.", order: 6 },
    { topicId: t9_4.id, type: "error_correction", difficulty: "intermediate", question: "There are a little books on the shelf.", correctAnswer: "There are a few books on the shelf.", explanation: "'Books' is countable. Use 'a few', not 'a little'.", order: 7 },
    { topicId: t9_4.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Rewrite with a negative meaning: 'There is a little time left.'", correctAnswer: "There is little time left.", explanation: "Removing 'a' changes the meaning from positive (some, enough) to negative (not enough).", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  const t9_5 = await db.grammarTopic.create({ data: { categoryId: cat9.id, title: "Each & Every", slug: "each-and-every", description: "Understand the subtle differences between each and every", level: "intermediate", order: 5 } });
  await db.grammarLesson.create({ data: { topicId: t9_5.id, content: `# Each & Every

Both 'each' and 'every' refer to all members of a group, but with different emphasis.

## Each
- Focuses on **individual members** of a group separately.
- Used with smaller groups (2 or more).
- **Each** student received a certificate. (one by one)
- Can be used with 'of': **Each of** the students...
- Can follow a noun: The students **each** received...

## Every
- Focuses on the **group as a whole**.
- Used with larger groups (3 or more).
- **Every** student passed the exam. (all of them, as a group)
- Cannot follow a noun.
- Used in generalizations: **Every** child needs love.

## Key Differences
- **Each** = individually, one by one
- **Every** = all together, without exception
- **Each** can stand alone: Give one to **each**. (not: Give one to every.)
- **Every** is used with time expressions: every day, every week, every time`, examples: JSON.stringify(["**Each** student has a different book. (individual focus)", "**Every** student must attend the meeting. (all, no exceptions)", "She checks her email **every** morning. (routine)", "**Each of** the rooms has a bathroom.", "They **each** paid $10. (each follows the pronoun)", "I visit my parents **every** weekend."]), tips: "Think of 'each' as looking at individuals one at a time, and 'every' as looking at the whole group. 'Each apple is different' (focusing on individuality). 'Every apple is delicious' (all of them, as a group)." } });
  for (const ex of [
    { topicId: t9_5.id, type: "multiple_choice", difficulty: "intermediate", question: "I go to the gym ___ day.", options: JSON.stringify(["each", "every", "both are correct", "all"]), correctAnswer: "every", explanation: "'Every day' is a fixed time expression meaning 'daily'. 'Every' is standard with time expressions.", order: 1 },
    { topicId: t9_5.id, type: "multiple_choice", difficulty: "intermediate", question: "___ of the three boys received a prize.", options: JSON.stringify(["Every", "Each", "All", "Both"]), correctAnswer: "Each", explanation: "'Each of' + plural noun is correct. 'Every of' is not grammatically correct.", order: 2 },
    { topicId: t9_5.id, type: "multiple_choice", difficulty: "intermediate", question: "Which emphasizes individuality?", options: JSON.stringify(["Every student is different.", "Each student is different.", "All students are different.", "Some students are different."]), correctAnswer: "Each student is different.", explanation: "'Each' focuses on individual members one by one — perfect for emphasizing differences.", order: 3 },
    { topicId: t9_5.id, type: "fill_in_blank", difficulty: "intermediate", question: "She reads a book ___ week.", correctAnswer: "every|each", explanation: "Both work with time expressions, though 'every' is more common in this fixed pattern.", order: 4 },
    { topicId: t9_5.id, type: "fill_in_blank", difficulty: "intermediate", question: "___ of the students submitted their assignment.", correctAnswer: "Each", explanation: "'Each of' + plural noun is correct. 'Every of' is not used.", order: 5 },
    { topicId: t9_5.id, type: "error_correction", difficulty: "intermediate", question: "Every of the children received a gift.", correctAnswer: "Each of the children received a gift.", explanation: "'Every of' is incorrect. Use 'each of' when followed by a specific group.", order: 6 },
    { topicId: t9_5.id, type: "error_correction", difficulty: "intermediate", question: "Each students has a textbook.", correctAnswer: "Each student has a textbook.", explanation: "'Each' is followed by a singular noun: 'each student' (not 'each students').", order: 7 },
    { topicId: t9_5.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Rewrite with 'each': 'All of the rooms have a TV.'", correctAnswer: "Each of the rooms has a TV.|Each room has a TV.", explanation: "'Each' takes a singular verb: 'has' (not 'have'). Focus on individual rooms.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  const t9_6 = await db.grammarTopic.create({ data: { categoryId: cat9.id, title: "Demonstratives (This/That/These/Those)", slug: "demonstratives", description: "Point to specific things using demonstrative determiners", level: "beginner", order: 6 } });
  await db.grammarLesson.create({ data: { topicId: t9_6.id, content: `# Demonstratives: This / That / These / Those

Demonstratives point to specific nouns and indicate distance from the speaker.

## Near the Speaker
- **This** (singular): **This** book is interesting. (near me, now)
- **These** (plural): **These** flowers are beautiful. (near me, now)

## Far from the Speaker
- **That** (singular): **That** building is old. (over there)
- **Those** (plural): **Those** mountains are beautiful. (far away)

## Time References
- **This/These** for current or upcoming time: **this** morning, **this** week, **these** days
- **That/Those** for past time: **that** day (a past day), **those** years

## As Pronouns
Demonstratives can replace nouns:
- **This** is my book. **That** is yours.
- **These** are my shoes. **Those** are his.

## On the Phone
- **This** = the speaker: **This** is Sarah speaking.
- **That** = the listener: Is **that** you, Mom?`, examples: JSON.stringify(["**This** is my favorite restaurant. (near/current)", "**That** was a great movie. (past/finished)", "**These** shoes are comfortable. (near, plural)", "**Those** days were wonderful. (past, plural)", "**This** is John speaking. (on the phone)", "I prefer **these** to **those**. (comparing near vs far)"]), tips: "Think of distance: THIS/THESE = near me (in space or time). THAT/THOSE = far from me (in space or time). 'This week' = the current week. 'That day' = a day in the past." } });
  for (const ex of [
    { topicId: t9_6.id, type: "multiple_choice", difficulty: "beginner", question: "___ books over there belong to Sarah.", options: JSON.stringify(["This", "These", "That", "Those"]), correctAnswer: "Those", explanation: "'Over there' indicates distance. 'Books' is plural. Far + plural = 'those'.", order: 1 },
    { topicId: t9_6.id, type: "multiple_choice", difficulty: "beginner", question: "On the phone: '___ is Maria speaking.'", options: JSON.stringify(["That", "This", "These", "Those"]), correctAnswer: "This", explanation: "The speaker identifies themselves with 'this' on the phone.", order: 2 },
    { topicId: t9_6.id, type: "multiple_choice", difficulty: "beginner", question: "Look at ___ beautiful sunset!", options: JSON.stringify(["this", "that", "these", "those"]), correctAnswer: "that", explanation: "The sunset is far away (in the sky). Use 'that' for distant singular things.", order: 3 },
    { topicId: t9_6.id, type: "fill_in_blank", difficulty: "beginner", question: "___ flowers in my hand are for you.", correctAnswer: "These", explanation: "'In my hand' = near the speaker. Plural flowers = 'these'.", order: 4 },
    { topicId: t9_6.id, type: "fill_in_blank", difficulty: "beginner", question: "Do you remember ___ summer when we went to the beach?", correctAnswer: "that", explanation: "'That' refers to a past time (a summer that has passed).", order: 5 },
    { topicId: t9_6.id, type: "error_correction", difficulty: "beginner", question: "This shoes are too big for me.", correctAnswer: "These shoes are too big for me.", explanation: "'Shoes' is plural. Use 'these' (plural, near), not 'this' (singular).", order: 6 },
    { topicId: t9_6.id, type: "error_correction", difficulty: "beginner", question: "Look at that stars in the sky!", correctAnswer: "Look at those stars in the sky!", explanation: "'Stars' is plural. Use 'those' (plural, far), not 'that' (singular).", order: 7 },
    { topicId: t9_6.id, type: "sentence_rewrite", difficulty: "beginner", question: "Change to plural: 'This apple is fresh.'", correctAnswer: "These apples are fresh.", explanation: "Singular 'this apple is' becomes plural 'these apples are'.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  console.log("  Category 9: Articles & Determiners - 6 topics seeded");

  // ============================================================
  // CATEGORY 10: Comparisons
  // ============================================================
  const cat10 = await db.grammarCategory.create({
    data: { name: "Comparisons", slug: "comparisons", description: "Compare people, things, and ideas using adjectives and adverbs", icon: "ArrowUpDown", order: 10 },
  });

  const t10_1 = await db.grammarTopic.create({ data: { categoryId: cat10.id, title: "Comparative Adjectives", slug: "comparative-adjectives", description: "Compare two things using comparative forms", level: "beginner", order: 1 } });
  await db.grammarLesson.create({ data: { topicId: t10_1.id, content: `# Comparative Adjectives

Comparatives are used to compare two things.

## Short Adjectives (1-2 syllables)
Add **-er + than**: tall → tall**er** than, fast → fast**er** than

### Spelling Rules
- Ending in -e: add -r (large → larger)
- Ending in consonant-vowel-consonant: double last letter (big → bigger, hot → hotter)
- Ending in -y: change y to i, add -er (happy → happier, easy → easier)

## Long Adjectives (2+ syllables)
Use **more + adjective + than**: more beautiful than, more expensive than

## Irregular Comparatives
- good → **better**, bad → **worse**, far → **farther/further**
- little → **less**, much/many → **more**

## Structure
- Subject + be + comparative + than + object
- She is **taller than** her sister.
- This book is **more interesting than** that one.`, examples: JSON.stringify(["She is **taller than** her brother.", "This test is **harder than** the last one.", "Paris is **more beautiful than** I expected.", "My new job is **better than** my old one.", "He drives **faster than** his father.", "English is **easier than** Chinese."]), tips: "Never use 'more' with -er forms! Say 'taller' NOT 'more taller'. Say 'more beautiful' NOT 'beautifuler'. The rule: 1 syllable = -er, 3+ syllables = more, 2 syllables = check (some use -er, some use more)." } });
  for (const ex of [
    { topicId: t10_1.id, type: "multiple_choice", difficulty: "beginner", question: "She is ___ her sister.", options: JSON.stringify(["taller than", "more tall than", "taller then", "tallest than"]), correctAnswer: "taller than", explanation: "'Tall' is a short adjective: add -er. Use 'than' (not 'then') for comparisons.", order: 1 },
    { topicId: t10_1.id, type: "multiple_choice", difficulty: "beginner", question: "This book is ___ than that one.", options: JSON.stringify(["interestinger", "more interesting", "most interesting", "more interestinger"]), correctAnswer: "more interesting", explanation: "'Interesting' has 4 syllables. Long adjectives use 'more + adjective'.", order: 2 },
    { topicId: t10_1.id, type: "multiple_choice", difficulty: "beginner", question: "What is the comparative of 'good'?", options: JSON.stringify(["gooder", "more good", "better", "best"]), correctAnswer: "better", explanation: "'Good' is irregular: good → better → best.", order: 3 },
    { topicId: t10_1.id, type: "fill_in_blank", difficulty: "beginner", question: "This exercise is ___ than the previous one. (easy)", correctAnswer: "easier", explanation: "Ending in -y: change y to i, add -er: easy → easier.", order: 4 },
    { topicId: t10_1.id, type: "fill_in_blank", difficulty: "beginner", question: "My house is ___ than yours. (big)", correctAnswer: "bigger", explanation: "CVC word: double the last consonant: big → bigger.", order: 5 },
    { topicId: t10_1.id, type: "error_correction", difficulty: "beginner", question: "She is more taller than her friend.", correctAnswer: "She is taller than her friend.", explanation: "Don't use 'more' with -er comparatives. Use one or the other.", order: 6 },
    { topicId: t10_1.id, type: "error_correction", difficulty: "beginner", question: "His car is faster then mine.", correctAnswer: "His car is faster than mine.", explanation: "Use 'than' (comparison) not 'then' (time). This is a very common spelling mistake.", order: 7 },
    { topicId: t10_1.id, type: "sentence_rewrite", difficulty: "beginner", question: "Write a comparison: 'This movie: exciting. That movie: not exciting.'", correctAnswer: "This movie is more exciting than that movie.|This movie is more exciting than that one.", explanation: "'Exciting' is a long adjective → more exciting than.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  const t10_2 = await db.grammarTopic.create({ data: { categoryId: cat10.id, title: "Superlative Adjectives", slug: "superlative-adjectives", description: "Compare one thing to all others using superlative forms", level: "beginner", order: 2 } });
  await db.grammarLesson.create({ data: { topicId: t10_2.id, content: `# Superlative Adjectives

Superlatives compare one thing to all others in a group. Always use **the** before a superlative.

## Short Adjectives: the + adjective + -est
- tall → **the tallest**, fast → **the fastest**

## Long Adjectives: the most + adjective
- beautiful → **the most beautiful**, expensive → **the most expensive**

## Irregular Superlatives
- good → **the best**, bad → **the worst**, far → **the farthest/furthest**

## Spelling Rules (same as comparative)
- -e: add -st (large → largest)
- CVC: double last letter (big → biggest)
- -y: change to -iest (happy → happiest)

## Structure
- Subject + be + **the** + superlative (+ in/of)
- She is **the tallest** student **in** the class.
- This is **the most beautiful** place **in** the world.
- He is **the best** player **of** all.`, examples: JSON.stringify(["She is **the tallest** girl in the school.", "This is **the most expensive** restaurant in the city.", "He is **the best** player on the team.", "Mount Everest is **the highest** mountain in the world.", "That was **the worst** movie I've ever seen.", "She is **the happiest** person I know."]), tips: "Always use 'the' before superlatives: THE tallest, THE most beautiful. Use 'in' for places/groups: the tallest in the class. Use 'of' for a defined set: the best of all." } });
  for (const ex of [
    { topicId: t10_2.id, type: "multiple_choice", difficulty: "beginner", question: "She is ___ student in our class.", options: JSON.stringify(["the smartest", "smartest", "the most smart", "smarter"]), correctAnswer: "the smartest", explanation: "Superlative of a short adjective: the + adj-est. Always include 'the'.", order: 1 },
    { topicId: t10_2.id, type: "multiple_choice", difficulty: "beginner", question: "This is ___ book I've ever read.", options: JSON.stringify(["the most interesting", "the interestingest", "more interesting", "most interesting"]), correctAnswer: "the most interesting", explanation: "Long adjective: the most + adjective.", order: 2 },
    { topicId: t10_2.id, type: "multiple_choice", difficulty: "beginner", question: "What is the superlative of 'bad'?", options: JSON.stringify(["the baddest", "the worst", "the most bad", "worse"]), correctAnswer: "the worst", explanation: "'Bad' is irregular: bad → worse → the worst.", order: 3 },
    { topicId: t10_2.id, type: "fill_in_blank", difficulty: "beginner", question: "The Nile is ___ ___ river in Africa. (long)", correctAnswer: "the longest", explanation: "Superlative: the + adjective + -est for short adjectives.", order: 4 },
    { topicId: t10_2.id, type: "fill_in_blank", difficulty: "beginner", question: "She is ___ ___ ___ person I have ever met. (kind)", correctAnswer: "the kindest", explanation: "'Kind' is a short adjective: the + adj-est = the kindest.", order: 5 },
    { topicId: t10_2.id, type: "error_correction", difficulty: "beginner", question: "He is tallest boy in the class.", correctAnswer: "He is the tallest boy in the class.", explanation: "Superlatives must have 'the' before them: THE tallest.", order: 6 },
    { topicId: t10_2.id, type: "error_correction", difficulty: "beginner", question: "This is the most cheapest phone in the store.", correctAnswer: "This is the cheapest phone in the store.", explanation: "Don't use 'most' with -est. Use one or the other.", order: 7 },
    { topicId: t10_2.id, type: "sentence_rewrite", difficulty: "beginner", question: "Write as superlative: 'No other city is bigger than Istanbul in Turkey.'", correctAnswer: "Istanbul is the biggest city in Turkey.", explanation: "'No other X is bigger than Y' = 'Y is the biggest X.'", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  const t10_3 = await db.grammarTopic.create({ data: { categoryId: cat10.id, title: "As...as Comparisons", slug: "as-as-comparisons", description: "Express equality and inequality using as...as", level: "intermediate", order: 3 } });
  await db.grammarLesson.create({ data: { topicId: t10_3.id, content: `# As...As Comparisons

The **as...as** structure expresses equality (or inequality in the negative).

## Positive: as + adjective/adverb + as
- She is **as tall as** her brother. (They are the same height.)
- He runs **as fast as** a professional athlete.

## Negative: not as + adjective/adverb + as
- She is **not as tall as** her father. (She is shorter.)
- This test is **not as difficult as** the last one. (This one is easier.)

## With Nouns: as much/many...as
- She has **as many books as** her friend.
- I don't have **as much money as** you.

## Common Expressions
- as soon as possible, as far as I know, as long as, as well as
- as white as snow, as busy as a bee, as cold as ice`, examples: JSON.stringify(["She is **as intelligent as** her brother. (equal)", "This movie is **not as good as** the last one. (unequal)", "He earns **as much money as** his colleague.", "She doesn't have **as many friends as** her sister.", "**As far as** I know, the meeting is at 3 PM.", "She ran **as fast as** she could."]), tips: "'Not as...as' is a softer way to make comparisons than using comparatives. 'She is not as tall as him' sounds gentler than 'She is shorter than him.' This is useful in polite conversation." } });
  for (const ex of [
    { topicId: t10_3.id, type: "multiple_choice", difficulty: "intermediate", question: "She is ___ her sister.", options: JSON.stringify(["as tall as", "as tall than", "so tall as", "as taller as"]), correctAnswer: "as tall as", explanation: "The structure is 'as + adjective (base form) + as'. No comparative form.", order: 1 },
    { topicId: t10_3.id, type: "multiple_choice", difficulty: "intermediate", question: "This exam is ___ the last one.", options: JSON.stringify(["not as difficult as", "not as difficult than", "not difficult as", "not as more difficult as"]), correctAnswer: "not as difficult as", explanation: "Negative equality: not as + adjective + as.", order: 2 },
    { topicId: t10_3.id, type: "multiple_choice", difficulty: "intermediate", question: "He has ___ books ___ I do.", options: JSON.stringify(["as many / as", "as much / as", "so many / as", "as many / than"]), correctAnswer: "as many / as", explanation: "'Books' is countable, so use 'as many...as'.", order: 3 },
    { topicId: t10_3.id, type: "fill_in_blank", difficulty: "intermediate", question: "This restaurant is not ___ expensive ___ the other one.", correctAnswer: "as ... as", explanation: "Not as + adjective + as = the negative equality comparison.", order: 4 },
    { topicId: t10_3.id, type: "fill_in_blank", difficulty: "intermediate", question: "She speaks English ___ ___ ___ a native speaker.", correctAnswer: "as well as|as fluently as", explanation: "'As + adverb + as' for comparing actions equally.", order: 5 },
    { topicId: t10_3.id, type: "error_correction", difficulty: "intermediate", question: "He is as taller as his brother.", correctAnswer: "He is as tall as his brother.", explanation: "Use the base form of the adjective with 'as...as', not the comparative form.", order: 6 },
    { topicId: t10_3.id, type: "error_correction", difficulty: "intermediate", question: "She has as much friends as me.", correctAnswer: "She has as many friends as me.", explanation: "'Friends' is countable. Use 'as many...as', not 'as much...as'.", order: 7 },
    { topicId: t10_3.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Rewrite using 'not as...as': 'My car is cheaper than yours.'", correctAnswer: "My car is not as expensive as yours.", explanation: "'Cheaper than' becomes 'not as expensive as' using the opposite adjective.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  const t10_4 = await db.grammarTopic.create({ data: { categoryId: cat10.id, title: "The more...the more", slug: "the-more-the-more", description: "Express parallel increases or decreases", level: "intermediate", order: 4 } });
  await db.grammarLesson.create({ data: { topicId: t10_4.id, content: `# The more...the more

This structure shows that two things change together — as one thing increases, the other increases (or decreases) too.

## Structure
**The + comparative, the + comparative**

- **The more** you practice, **the better** you become.
- **The harder** you work, **the more** you earn.
- **The less** you eat, **the thinner** you get.

## Variations
- The more + noun: **The more books** you read, the smarter you get.
- The more + verb: **The more** I study, the more I understand.
- The less...the less: **The less** you sleep, **the worse** you feel.
- Short form: **The sooner, the better.** (the sooner it happens, the better it is)

## Common Expressions
- The more, the merrier. (more people = more fun)
- The sooner, the better.
- The bigger they are, the harder they fall.`, examples: JSON.stringify(["**The more** you read, **the more** you know.", "**The harder** you study, **the better** your grades will be.", "**The older** I get, **the wiser** I become.", "**The less** sugar you eat, **the healthier** you will be.", "**The more expensive** the hotel, **the better** the service.", "**The sooner**, **the better**. (fixed expression)"]), tips: "Always use 'the' before both comparatives. Don't forget the comma between the two clauses. This structure is very common in both spoken and written English." } });
  for (const ex of [
    { topicId: t10_4.id, type: "multiple_choice", difficulty: "intermediate", question: "___ you practice, ___ you will become.", options: JSON.stringify(["The more / the better", "More / better", "The most / the best", "Most / best"]), correctAnswer: "The more / the better", explanation: "The + comparative, the + comparative for parallel changes.", order: 1 },
    { topicId: t10_4.id, type: "multiple_choice", difficulty: "intermediate", question: "Which is correct?", options: JSON.stringify(["More you eat, fatter you get.", "The more you eat, the fatter you get.", "The most you eat, the fattest you get.", "More you eat, more fat you get."]), correctAnswer: "The more you eat, the fatter you get.", explanation: "Always use 'the' before both comparatives in this structure.", order: 2 },
    { topicId: t10_4.id, type: "multiple_choice", difficulty: "intermediate", question: "The less you sleep, ___.", options: JSON.stringify(["the worse you feel", "the worst you feel", "the bad you feel", "the more bad you feel"]), correctAnswer: "the worse you feel", explanation: "'Bad' → comparative 'worse'. The less → the worse (parallel decrease/increase).", order: 3 },
    { topicId: t10_4.id, type: "fill_in_blank", difficulty: "intermediate", question: "The ___ you study, the ___ your results will be. (hard / good)", correctAnswer: "harder ... better", explanation: "Use comparative forms: hard → harder, good → better.", order: 4 },
    { topicId: t10_4.id, type: "fill_in_blank", difficulty: "intermediate", question: "___ ___ books you read, ___ ___ vocabulary you will have.", correctAnswer: "The more ... the more", explanation: "'The more...the more' with nouns shows parallel increase.", order: 5 },
    { topicId: t10_4.id, type: "error_correction", difficulty: "intermediate", question: "More you practice, better you get.", correctAnswer: "The more you practice, the better you get.", explanation: "Always include 'the' before both comparatives.", order: 6 },
    { topicId: t10_4.id, type: "error_correction", difficulty: "intermediate", question: "The more expensive the car, more comfortable it is.", correctAnswer: "The more expensive the car, the more comfortable it is.", explanation: "Both parts need 'the + comparative'.", order: 7 },
    { topicId: t10_4.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Express with 'the more...the more': 'If you read a lot, you will learn a lot.'", correctAnswer: "The more you read, the more you will learn.|The more you read, the more you learn.", explanation: "Convert cause-effect to 'the more...the more' parallel structure.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  console.log("  Category 10: Comparisons - 4 topics seeded");

  // ============================================================
  // CATEGORY 11: Gerunds & Infinitives
  // ============================================================
  const cat11 = await db.grammarCategory.create({
    data: { name: "Gerunds & Infinitives", slug: "gerunds-and-infinitives", description: "Know when to use -ing forms and to + verb", icon: "Repeat", order: 11 },
  });

  const t11_1 = await db.grammarTopic.create({ data: { categoryId: cat11.id, title: "Gerunds as Subject & Object", slug: "gerunds-subject-object", description: "Use the -ing form of verbs as nouns", level: "intermediate", order: 1 } });
  await db.grammarLesson.create({ data: { topicId: t11_1.id, content: `# Gerunds as Subject & Object

A **gerund** is the -ing form of a verb used as a noun.

## Gerund as Subject
- **Swimming** is great exercise.
- **Reading** helps you learn new words.
- **Cooking** relaxes me.

## Gerund as Object (after certain verbs)
Many verbs are followed by a gerund:
- enjoy, finish, avoid, mind, suggest, consider, keep, practice, deny, imagine, risk, quit, miss, postpone, admit, appreciate, delay, recommend

- I **enjoy reading** books.
- She **avoids eating** fast food.
- He **finished writing** the report.
- Would you **mind closing** the door?

## Gerund after Prepositions
After all prepositions, use a gerund:
- She is good **at singing**.
- I'm interested **in learning** French.
- He left **without saying** goodbye.
- Thank you **for helping** me.

## Common Expressions with Gerunds
- It's no use / It's no good + gerund: It's no use **crying** over spilt milk.
- be/get used to + gerund: I'm used to **waking** up early.
- look forward to + gerund: I look forward to **seeing** you.`, examples: JSON.stringify(["**Swimming** is my favorite sport. (subject)", "I enjoy **reading** before bed. (object after 'enjoy')", "She is good at **playing** the piano. (after preposition)", "He suggested **going** to a restaurant. (object after 'suggest')", "I look forward to **meeting** you. (expression)", "**Studying** abroad was the best decision I ever made. (subject)"]), tips: "A common trick: 'look forward to' uses a gerund, not an infinitive! 'I look forward to seeing you' (NOT 'to see you'). The 'to' here is a preposition, not part of an infinitive. Same with 'be used to doing' and 'be committed to helping'." } });
  for (const ex of [
    { topicId: t11_1.id, type: "multiple_choice", difficulty: "intermediate", question: "___ is a great way to stay fit.", options: JSON.stringify(["Swim", "Swimming", "To swim", "Swam"]), correctAnswer: "Swimming", explanation: "A gerund (verb-ing) is used as the subject of a sentence.", order: 1 },
    { topicId: t11_1.id, type: "multiple_choice", difficulty: "intermediate", question: "She enjoys ___ in the morning.", options: JSON.stringify(["to run", "running", "run", "ran"]), correctAnswer: "running", explanation: "'Enjoy' is always followed by a gerund, not an infinitive.", order: 2 },
    { topicId: t11_1.id, type: "multiple_choice", difficulty: "intermediate", question: "I look forward to ___ you at the party.", options: JSON.stringify(["see", "seeing", "to see", "saw"]), correctAnswer: "seeing", explanation: "'Look forward to' takes a gerund. The 'to' is a preposition here, not part of an infinitive.", order: 3 },
    { topicId: t11_1.id, type: "fill_in_blank", difficulty: "intermediate", question: "He is interested in ___ a new language. (learn)", correctAnswer: "learning", explanation: "After the preposition 'in', use a gerund: learning.", order: 4 },
    { topicId: t11_1.id, type: "fill_in_blank", difficulty: "intermediate", question: "She avoids ___ junk food. (eat)", correctAnswer: "eating", explanation: "'Avoid' is always followed by a gerund.", order: 5 },
    { topicId: t11_1.id, type: "error_correction", difficulty: "intermediate", question: "I enjoy to read books in the evening.", correctAnswer: "I enjoy reading books in the evening.", explanation: "'Enjoy' takes a gerund (reading), not an infinitive (to read).", order: 6 },
    { topicId: t11_1.id, type: "error_correction", difficulty: "intermediate", question: "She is good at to cook.", correctAnswer: "She is good at cooking.", explanation: "After prepositions (at, in, of, etc.), always use a gerund, not an infinitive.", order: 7 },
    { topicId: t11_1.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Start with a gerund: 'It is important to learn new things.'", correctAnswer: "Learning new things is important.", explanation: "Move the gerund to the subject position: 'Learning new things' is the subject.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  const t11_2 = await db.grammarTopic.create({ data: { categoryId: cat11.id, title: "Infinitives of Purpose", slug: "infinitives-of-purpose", description: "Use to + verb to explain why someone does something", level: "intermediate", order: 2 } });
  await db.grammarLesson.create({ data: { topicId: t11_2.id, content: `# Infinitives of Purpose

An **infinitive of purpose** explains why someone does something. It answers the question "Why?"

## Form
**to + base verb** or **in order to + base verb**

- I went to the store **to buy** milk.
- She studies hard **to pass** the exam.
- He left early **in order to avoid** traffic.

## Negative Purpose
**in order not to** or **so as not to**
- I whispered **in order not to** wake the baby.
- She left early **so as not to** be late.

## Infinitive after Certain Verbs
Some verbs are followed by infinitives:
- want, need, decide, hope, expect, plan, promise, agree, refuse, offer, learn, afford, manage, pretend, seem, appear, tend, arrange

- I **want to learn** English.
- She **decided to study** abroad.
- They **agreed to help** us.

## Infinitive after Adjectives
- I'm **happy to help**.
- It's **easy to understand**.
- She was **surprised to see** me.

## Infinitive after Verb + Object
- tell, ask, invite, advise, encourage, remind, allow, expect, want, need
- She **asked me to help** her.
- The teacher **told us to study** harder.`, examples: JSON.stringify(["I went to the library **to study**. (purpose)", "She saved money **in order to** buy a car.", "He speaks quietly **so as not to** disturb others.", "I **want to travel** the world. (verb + infinitive)", "She was **happy to hear** the news. (adjective + infinitive)", "The doctor **advised me to rest**. (verb + object + infinitive)"]), tips: "If someone asks 'Why did you do that?', you can answer with an infinitive of purpose: 'To save money', 'To get a better job', 'To help my friend'. It's a concise way to express reasons." } });
  for (const ex of [
    { topicId: t11_2.id, type: "multiple_choice", difficulty: "intermediate", question: "She went to the gym ___ fit.", options: JSON.stringify(["for get", "to get", "getting", "for to get"]), correctAnswer: "to get", explanation: "Infinitive of purpose: 'to + base verb' explains why she went.", order: 1 },
    { topicId: t11_2.id, type: "multiple_choice", difficulty: "intermediate", question: "He whispered ___ wake the baby.", options: JSON.stringify(["to not", "not to", "in order not to", "for not"]), correctAnswer: "in order not to", explanation: "Negative purpose: 'in order not to' or 'so as not to'.", order: 2 },
    { topicId: t11_2.id, type: "multiple_choice", difficulty: "intermediate", question: "I decided ___ a new language.", options: JSON.stringify(["learning", "to learn", "learn", "learned"]), correctAnswer: "to learn", explanation: "'Decide' is followed by an infinitive (to + verb).", order: 3 },
    { topicId: t11_2.id, type: "fill_in_blank", difficulty: "intermediate", question: "She studies hard ___ ___ good grades.", correctAnswer: "to get|to earn", explanation: "Infinitive of purpose answers 'why': she studies hard to get/earn good grades.", order: 4 },
    { topicId: t11_2.id, type: "fill_in_blank", difficulty: "intermediate", question: "The teacher asked us ___ ___ our textbooks. (bring)", correctAnswer: "to bring", explanation: "Verb + object + infinitive: asked us to bring.", order: 5 },
    { topicId: t11_2.id, type: "error_correction", difficulty: "intermediate", question: "I went to the store for to buy some bread.", correctAnswer: "I went to the store to buy some bread.", explanation: "Don't use 'for to'. The infinitive 'to buy' alone expresses purpose.", order: 6 },
    { topicId: t11_2.id, type: "error_correction", difficulty: "intermediate", question: "She decided learning French.", correctAnswer: "She decided to learn French.", explanation: "'Decide' takes an infinitive (to learn), not a gerund (learning).", order: 7 },
    { topicId: t11_2.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Combine: 'He got up early. He wanted to catch the bus.'", correctAnswer: "He got up early to catch the bus.|He got up early in order to catch the bus.", explanation: "Use infinitive of purpose to combine the reason with the action.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  const t11_3 = await db.grammarTopic.create({ data: { categoryId: cat11.id, title: "Verbs Followed by Gerund or Infinitive", slug: "gerund-or-infinitive-verbs", description: "Know which verbs take gerunds, infinitives, or both", level: "advanced", order: 3 } });
  await db.grammarLesson.create({ data: { topicId: t11_3.id, content: `# Verbs Followed by Gerund or Infinitive

Some verbs take only gerunds, some only infinitives, and some can take either (sometimes with a change in meaning).

## Verbs + Gerund Only
enjoy, finish, avoid, mind, suggest, consider, keep, practice, deny, imagine, risk, quit, miss, postpone, admit, appreciate, delay, recommend

## Verbs + Infinitive Only
want, need, decide, hope, expect, plan, promise, agree, refuse, offer, learn, afford, manage, pretend, seem, appear, tend, arrange

## Verbs + Either (No Change in Meaning)
begin, start, continue, like, love, hate, prefer
- I **like swimming**. = I **like to swim**.

## Verbs + Either (WITH Change in Meaning)
- **remember + gerund** = recall a past action: I remember **locking** the door. (I locked it, and I recall doing it)
- **remember + infinitive** = don't forget to do: Remember **to lock** the door. (Don't forget!)
- **stop + gerund** = quit the activity: He stopped **smoking**. (He quit.)
- **stop + infinitive** = pause in order to: He stopped **to smoke**. (He paused to have a cigarette.)
- **try + gerund** = experiment: Try **adding** more salt. (experiment with it)
- **try + infinitive** = make an effort: I tried **to open** the door. (I attempted but maybe failed)
- **forget + gerund** = forget a past action: I'll never forget **meeting** you. (memory)
- **forget + infinitive** = neglect to do: Don't forget **to call** me. (reminder)`, examples: JSON.stringify(["I **enjoy swimming**. (gerund only)", "She **wants to travel**. (infinitive only)", "I **remember locking** the door. (I recall the past action)", "**Remember to lock** the door. (Don't forget!)", "He **stopped smoking**. (He quit.)", "He **stopped to smoke**. (He paused for a cigarette.)", "**Try adding** more sugar. (experiment)", "I **tried to open** the jar but couldn't. (attempt)"]), tips: "The 'stop/remember/try/forget' distinction is the most commonly tested grammar point. Create mental images: 'I remember locking' (picture yourself in the past, turning the key). 'Remember to lock' (someone reminding you before you leave)." } });
  for (const ex of [
    { topicId: t11_3.id, type: "multiple_choice", difficulty: "advanced", question: "He stopped ___ because the doctor told him to.", options: JSON.stringify(["to smoke", "smoking", "smoke", "smoked"]), correctAnswer: "smoking", explanation: "'Stopped smoking' = quit the habit. 'Stopped to smoke' would mean he paused to have a cigarette.", order: 1 },
    { topicId: t11_3.id, type: "multiple_choice", difficulty: "advanced", question: "I remember ___ the door this morning.", options: JSON.stringify(["to lock", "locking", "lock", "locked"]), correctAnswer: "locking", explanation: "'Remember + gerund' = recall a past action. I recall the action of locking the door.", order: 2 },
    { topicId: t11_3.id, type: "multiple_choice", difficulty: "advanced", question: "She tried ___ the window but it was stuck.", options: JSON.stringify(["opening", "to open", "open", "opened"]), correctAnswer: "to open", explanation: "'Tried + infinitive' = made an effort/attempt (but possibly failed).", order: 3 },
    { topicId: t11_3.id, type: "fill_in_blank", difficulty: "advanced", question: "I'll never forget ___ you for the first time. (meet)", correctAnswer: "meeting", explanation: "'Forget + gerund' = forget a past experience. This is a memory.", order: 4 },
    { topicId: t11_3.id, type: "fill_in_blank", difficulty: "advanced", question: "Don't forget ___ your mother. She's waiting. (call)", correctAnswer: "to call", explanation: "'Forget + infinitive' = neglect to do something. A reminder about a future action.", order: 5 },
    { topicId: t11_3.id, type: "error_correction", difficulty: "advanced", question: "She avoids to eat spicy food.", correctAnswer: "She avoids eating spicy food.", explanation: "'Avoid' is always followed by a gerund, not an infinitive.", order: 6 },
    { topicId: t11_3.id, type: "error_correction", difficulty: "advanced", question: "He wants learning English.", correctAnswer: "He wants to learn English.", explanation: "'Want' is always followed by an infinitive, not a gerund.", order: 7 },
    { topicId: t11_3.id, type: "sentence_rewrite", difficulty: "advanced", question: "Express as a past memory: 'I can still recall my first day at school.'", correctAnswer: "I remember starting school.|I remember going to school for the first time.", explanation: "'Remember + gerund' expresses recalling a past experience.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  console.log("  Category 11: Gerunds & Infinitives - 3 topics seeded");

  // ============================================================
  // CATEGORY 12: Phrasal Verbs
  // ============================================================
  const cat12 = await db.grammarCategory.create({
    data: { name: "Phrasal Verbs", slug: "phrasal-verbs", description: "Master common multi-word verbs used in everyday English", icon: "Puzzle", order: 12 },
  });

  const t12_1 = await db.grammarTopic.create({ data: { categoryId: cat12.id, title: "Phrasal Verbs of Movement", slug: "phrasal-verbs-movement", description: "Learn phrasal verbs related to physical movement and direction", level: "intermediate", order: 1 } });
  await db.grammarLesson.create({ data: { topicId: t12_1.id, content: `# Phrasal Verbs of Movement

Phrasal verbs combine a verb with a particle (preposition/adverb) to create a new meaning.

## Common Movement Phrasal Verbs
- **get up** = rise from bed/seat: I **get up** at 7 AM.
- **get on/off** = board/leave transport: She **got on** the bus.
- **get in/out (of)** = enter/leave a car: He **got in** the taxi.
- **come in / go out** = enter / leave a place: Please **come in**.
- **turn around** = change to face the opposite direction.
- **set off / set out** = begin a journey: We **set off** at dawn.
- **take off** = (airplane) leave the ground: The plane **took off** at noon.
- **pick up / drop off** = collect / leave someone: I'll **pick you up** at 5.
- **run away** = escape, flee: The dog **ran away** from home.
- **slow down / speed up** = decrease / increase speed.
- **break down** = (vehicle) stop working: My car **broke down** on the highway.`, examples: JSON.stringify(["I **get up** at 6 AM every day.", "She **got off** the train at the next stop.", "We **set off** for the mountains early.", "The plane **took off** on time.", "Can you **pick me up** from the airport?", "The car **broke down** in the middle of the road."]), tips: "With phrasal verbs, the particle changes the meaning completely. 'Get' alone means receive/obtain, but 'get up' = rise, 'get on' = board, 'get off' = leave, 'get in' = enter. Learn them as complete units!" } });
  for (const ex of [
    { topicId: t12_1.id, type: "multiple_choice", difficulty: "intermediate", question: "I ___ at 6 AM every morning.", options: JSON.stringify(["get up", "get on", "get in", "get off"]), correctAnswer: "get up", explanation: "'Get up' means to rise from bed.", order: 1 },
    { topicId: t12_1.id, type: "multiple_choice", difficulty: "intermediate", question: "She ___ the bus at the wrong stop.", options: JSON.stringify(["got up", "got in", "got off", "got away"]), correctAnswer: "got off", explanation: "'Get off' means to leave public transport (bus, train, plane).", order: 2 },
    { topicId: t12_1.id, type: "multiple_choice", difficulty: "intermediate", question: "The plane ___ at exactly 3 PM.", options: JSON.stringify(["took on", "took off", "took up", "took out"]), correctAnswer: "took off", explanation: "'Take off' means (of an airplane) to leave the ground.", order: 3 },
    { topicId: t12_1.id, type: "fill_in_blank", difficulty: "intermediate", question: "We ___ ___ for our holiday early in the morning.", correctAnswer: "set off|set out", explanation: "'Set off/out' means to begin a journey.", order: 4 },
    { topicId: t12_1.id, type: "fill_in_blank", difficulty: "intermediate", question: "My car ___ ___ on the way to work.", correctAnswer: "broke down", explanation: "'Break down' = (of a vehicle) stop working.", order: 5 },
    { topicId: t12_1.id, type: "error_correction", difficulty: "intermediate", question: "She got in the bus at the station.", correctAnswer: "She got on the bus at the station.", explanation: "For buses, trains, planes: use 'get on/off'. For cars, taxis: use 'get in/out of'.", order: 6 },
    { topicId: t12_1.id, type: "error_correction", difficulty: "intermediate", question: "Please slow up! You're driving too fast.", correctAnswer: "Please slow down! You're driving too fast.", explanation: "'Slow down' means decrease speed. 'Speed up' means increase speed.", order: 7 },
    { topicId: t12_1.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Rewrite using a phrasal verb: 'I will collect you from the airport.'", correctAnswer: "I will pick you up from the airport.", explanation: "'Pick up' means to collect someone from a place.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  const t12_2 = await db.grammarTopic.create({ data: { categoryId: cat12.id, title: "Phrasal Verbs for Work", slug: "phrasal-verbs-work", description: "Learn phrasal verbs commonly used in work and business contexts", level: "intermediate", order: 2 } });
  await db.grammarLesson.create({ data: { topicId: t12_2.id, content: `# Phrasal Verbs for Work

## Common Work Phrasal Verbs
- **carry out** = perform/conduct: We **carried out** a survey.
- **set up** = establish/create: She **set up** her own business.
- **take on** = accept work/hire: The company **took on** new employees.
- **put off** = postpone: They **put off** the meeting until next week.
- **deal with** = handle: She **deals with** customer complaints.
- **come up with** = think of (an idea): He **came up with** a brilliant plan.
- **look into** = investigate: We need to **look into** this problem.
- **fill in** = complete (a form): Please **fill in** this application form.
- **take over** = take control of: She **took over** the company.
- **lay off** = make redundant: The factory **laid off** 200 workers.
- **hand in** = submit: Please **hand in** your assignments by Friday.
- **figure out** = solve/understand: I can't **figure out** this problem.`, examples: JSON.stringify(["The team **carried out** the research successfully.", "She **set up** a new company last year.", "We need to **come up with** a solution.", "The boss **put off** the meeting.", "Can you **fill in** this form, please?", "I need to **figure out** how to fix this."]), tips: "Many work phrasal verbs are separable: you can put the object between the verb and particle. 'Fill in the form' or 'Fill the form in'. But with pronouns, you MUST separate: 'Fill it in' (NOT 'Fill in it')." } });
  for (const ex of [
    { topicId: t12_2.id, type: "multiple_choice", difficulty: "intermediate", question: "The company ___ 50 new workers last month.", options: JSON.stringify(["took on", "took off", "took up", "took over"]), correctAnswer: "took on", explanation: "'Take on' = hire/employ new people.", order: 1 },
    { topicId: t12_2.id, type: "multiple_choice", difficulty: "intermediate", question: "They ___ the meeting until next Monday.", options: JSON.stringify(["put on", "put off", "put up", "put away"]), correctAnswer: "put off", explanation: "'Put off' = postpone/delay.", order: 2 },
    { topicId: t12_2.id, type: "multiple_choice", difficulty: "intermediate", question: "She ___ a great idea for the marketing campaign.", options: JSON.stringify(["came up with", "came across", "came over", "came down"]), correctAnswer: "came up with", explanation: "'Come up with' = think of/produce (an idea, plan, solution).", order: 3 },
    { topicId: t12_2.id, type: "fill_in_blank", difficulty: "intermediate", question: "Please ___ ___ this form and return it to the office.", correctAnswer: "fill in|fill out", explanation: "'Fill in/out' = complete a form or document.", order: 4 },
    { topicId: t12_2.id, type: "fill_in_blank", difficulty: "intermediate", question: "We need to ___ ___ this issue before it gets worse.", correctAnswer: "look into|deal with", explanation: "'Look into' = investigate. 'Deal with' = handle/manage.", order: 5 },
    { topicId: t12_2.id, type: "error_correction", difficulty: "intermediate", question: "She set up her own business. → She set it up. (NOT: She set up it.)", correctAnswer: "She set it up.", explanation: "With pronouns, separable phrasal verbs MUST be split: 'set it up', not 'set up it'.", order: 6 },
    { topicId: t12_2.id, type: "error_correction", difficulty: "intermediate", question: "Please hand your assignment in by Friday. → Please hand in it by Friday.", correctAnswer: "Please hand it in by Friday.", explanation: "Pronouns must go between the verb and particle: 'hand it in', not 'hand in it'.", order: 7 },
    { topicId: t12_2.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Rewrite using a phrasal verb: 'She established a new business.'", correctAnswer: "She set up a new business.", explanation: "'Set up' = establish/start/create.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  const t12_3 = await db.grammarTopic.create({ data: { categoryId: cat12.id, title: "Phrasal Verbs for Relationships", slug: "phrasal-verbs-relationships", description: "Learn phrasal verbs about social and personal relationships", level: "intermediate", order: 3 } });
  await db.grammarLesson.create({ data: { topicId: t12_3.id, content: `# Phrasal Verbs for Relationships

## Common Relationship Phrasal Verbs
- **get along (with)** = have a good relationship: I **get along with** my neighbors.
- **fall out (with)** = have an argument/stop being friends: They **fell out** over money.
- **make up** = become friends again after an argument: They argued but **made up** later.
- **break up (with)** = end a romantic relationship: She **broke up with** her boyfriend.
- **ask out** = invite on a date: He **asked her out** to dinner.
- **go out (with)** = date someone: They've been **going out** for six months.
- **look up to** = admire/respect: I **look up to** my parents.
- **look down on** = think someone is inferior: She **looks down on** people who didn't go to university.
- **put up with** = tolerate: I can't **put up with** his behavior anymore.
- **let down** = disappoint: He **let me down** by not coming.
- **bring up** = raise (a child): She **brought up** three children alone.`, examples: JSON.stringify(["I **get along with** all my colleagues.", "They **fell out** over a silly argument.", "We argued yesterday but **made up** today.", "She **broke up with** him last month.", "I really **look up to** my teacher.", "I can't **put up with** the noise anymore."]), tips: "Relationship phrasal verbs are very common in everyday conversation. They are much more natural than their formal equivalents: 'We get along' sounds more natural than 'We have a good relationship'." } });
  for (const ex of [
    { topicId: t12_3.id, type: "multiple_choice", difficulty: "intermediate", question: "I ___ really well with my colleagues.", options: JSON.stringify(["get along", "get on", "get up", "both A and B"]), correctAnswer: "both A and B", explanation: "Both 'get along with' and 'get on with' mean to have a good relationship.", order: 1 },
    { topicId: t12_3.id, type: "multiple_choice", difficulty: "intermediate", question: "She ___ her boyfriend last week.", options: JSON.stringify(["broke up with", "broke down with", "broke out with", "broke off with"]), correctAnswer: "broke up with", explanation: "'Break up with' = end a romantic relationship.", order: 2 },
    { topicId: t12_3.id, type: "multiple_choice", difficulty: "intermediate", question: "I ___ my grandmother. She's my role model.", options: JSON.stringify(["look up to", "look down on", "look after", "look into"]), correctAnswer: "look up to", explanation: "'Look up to' = admire and respect someone.", order: 3 },
    { topicId: t12_3.id, type: "fill_in_blank", difficulty: "intermediate", question: "They argued last week but ___ ___ the next day.", correctAnswer: "made up", explanation: "'Make up' = become friends again after a disagreement.", order: 4 },
    { topicId: t12_3.id, type: "fill_in_blank", difficulty: "intermediate", question: "I can't ___ ___ ___ his constant complaining.", correctAnswer: "put up with", explanation: "'Put up with' = tolerate something annoying or unpleasant.", order: 5 },
    { topicId: t12_3.id, type: "error_correction", difficulty: "intermediate", question: "She looks up at her mother as a role model.", correctAnswer: "She looks up to her mother as a role model.", explanation: "'Look up to' (admire), not 'look up at' (physically look upward).", order: 6 },
    { topicId: t12_3.id, type: "error_correction", difficulty: "intermediate", question: "He let down me by not keeping his promise.", correctAnswer: "He let me down by not keeping his promise.", explanation: "With separable phrasal verbs + pronouns, the pronoun goes between: 'let me down'.", order: 7 },
    { topicId: t12_3.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Rewrite with a phrasal verb: 'I can't tolerate his behavior.'", correctAnswer: "I can't put up with his behavior.", explanation: "'Put up with' = tolerate/endure.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  const t12_4 = await db.grammarTopic.create({ data: { categoryId: cat12.id, title: "Phrasal Verbs for Daily Life", slug: "phrasal-verbs-daily-life", description: "Learn phrasal verbs used in everyday situations", level: "beginner", order: 4 } });
  await db.grammarLesson.create({ data: { topicId: t12_4.id, content: `# Phrasal Verbs for Daily Life

## Common Daily Life Phrasal Verbs
- **wake up** = stop sleeping: I **wake up** at 7 AM.
- **turn on / turn off** = start / stop a device: **Turn on** the lights.
- **put on / take off** = wear / remove clothes: She **put on** her coat.
- **pick up** = lift from a surface: **Pick up** your clothes!
- **throw away** = discard: Don't **throw away** that box.
- **clean up** = make tidy: We need to **clean up** the kitchen.
- **run out of** = have no more: We've **run out of** milk.
- **look for** = try to find/search: I'm **looking for** my keys.
- **find out** = discover: I **found out** the truth.
- **give up** = stop trying: Don't **give up**!
- **try on** = test clothes by wearing them: She **tried on** five dresses.
- **go on** = continue: Please **go on** with your story.`, examples: JSON.stringify(["Please **turn off** the TV before you go to bed.", "She **put on** her jacket and left.", "We've **run out of** sugar. Can you buy some?", "I'm **looking for** a new apartment.", "He **found out** that she was lying.", "Don't **give up**! Keep trying!"]), tips: "Daily life phrasal verbs are some of the first ones you should learn because native speakers use them constantly. They are more natural than their one-word equivalents: 'turn off' is more common than 'extinguish', 'find out' more common than 'discover'." } });
  for (const ex of [
    { topicId: t12_4.id, type: "multiple_choice", difficulty: "beginner", question: "Please ___ the lights when you leave.", options: JSON.stringify(["turn off", "turn on", "turn up", "turn down"]), correctAnswer: "turn off", explanation: "'Turn off' = stop a device. 'Turn on' = start a device.", order: 1 },
    { topicId: t12_4.id, type: "multiple_choice", difficulty: "beginner", question: "We've ___ milk. We need to buy more.", options: JSON.stringify(["run out of", "run into", "run over", "run away"]), correctAnswer: "run out of", explanation: "'Run out of' = have no more of something.", order: 2 },
    { topicId: t12_4.id, type: "multiple_choice", difficulty: "beginner", question: "I'm ___ my glasses. Have you seen them?", options: JSON.stringify(["looking for", "looking at", "looking after", "looking up"]), correctAnswer: "looking for", explanation: "'Look for' = try to find/search for something.", order: 3 },
    { topicId: t12_4.id, type: "fill_in_blank", difficulty: "beginner", question: "She ___ ___ her coat because it was cold.", correctAnswer: "put on", explanation: "'Put on' = wear a piece of clothing.", order: 4 },
    { topicId: t12_4.id, type: "fill_in_blank", difficulty: "beginner", question: "Don't ___ ___! You can do it if you keep trying.", correctAnswer: "give up", explanation: "'Give up' = stop trying/quit.", order: 5 },
    { topicId: t12_4.id, type: "error_correction", difficulty: "beginner", question: "Turn the TV off. → Turn off it.", correctAnswer: "Turn it off.", explanation: "With pronouns, the pronoun goes between verb and particle: 'turn it off', not 'turn off it'.", order: 6 },
    { topicId: t12_4.id, type: "error_correction", difficulty: "beginner", question: "I'm looking my keys. I can't find them.", correctAnswer: "I'm looking for my keys. I can't find them.", explanation: "'Look' alone means to use your eyes. 'Look for' means to search/try to find.", order: 7 },
    { topicId: t12_4.id, type: "sentence_rewrite", difficulty: "beginner", question: "Rewrite using a phrasal verb: 'I discovered the answer by accident.'", correctAnswer: "I found out the answer by accident.", explanation: "'Find out' = discover information.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  const t12_5 = await db.grammarTopic.create({ data: { categoryId: cat12.id, title: "Phrasal Verbs for Communication", slug: "phrasal-verbs-communication", description: "Learn phrasal verbs related to speaking, writing, and communication", level: "intermediate", order: 5 } });
  await db.grammarLesson.create({ data: { topicId: t12_5.id, content: `# Phrasal Verbs for Communication

## Common Communication Phrasal Verbs
- **bring up** = mention a topic: She **brought up** an interesting point.
- **speak up** = talk louder: Could you **speak up**? I can't hear you.
- **point out** = draw attention to: He **pointed out** several errors.
- **call back** = return a phone call: I'll **call you back** in five minutes.
- **hang up** = end a phone call: She **hung up** the phone.
- **write down** = note/record: **Write down** the address.
- **go over** = review: Let's **go over** the plan once more.
- **talk over** = discuss: We need to **talk it over** before deciding.
- **turn down** = refuse/reject: She **turned down** the job offer.
- **cut off** = interrupt/disconnect: The call was **cut off**.
- **sum up** = summarize: Let me **sum up** the main points.
- **get through (to)** = reach by phone / make someone understand: I can't **get through** to her.`, examples: JSON.stringify(["Don't **bring up** politics at dinner.", "**Speak up**! We can't hear you at the back.", "She **pointed out** that the data was wrong.", "I'll **call you back** after the meeting.", "Please **write down** the homework assignment.", "He **turned down** the invitation."]), tips: "Communication phrasal verbs are essential for everyday English. In business English, you'll hear 'bring up' (mention), 'go over' (review), and 'sum up' (summarize) very frequently." } });
  for (const ex of [
    { topicId: t12_5.id, type: "multiple_choice", difficulty: "intermediate", question: "Could you ___ please? I can't hear you.", options: JSON.stringify(["speak up", "speak out", "speak off", "speak down"]), correctAnswer: "speak up", explanation: "'Speak up' = talk louder.", order: 1 },
    { topicId: t12_5.id, type: "multiple_choice", difficulty: "intermediate", question: "She ___ the job offer because the salary was too low.", options: JSON.stringify(["turned down", "turned up", "turned on", "turned off"]), correctAnswer: "turned down", explanation: "'Turn down' = refuse/reject an offer.", order: 2 },
    { topicId: t12_5.id, type: "multiple_choice", difficulty: "intermediate", question: "Let me ___ the main points of today's lesson.", options: JSON.stringify(["sum up", "bring up", "speak up", "call back"]), correctAnswer: "sum up", explanation: "'Sum up' = summarize the key points.", order: 3 },
    { topicId: t12_5.id, type: "fill_in_blank", difficulty: "intermediate", question: "Don't ___ ___ politics at the dinner table.", correctAnswer: "bring up", explanation: "'Bring up' = introduce/mention a topic in conversation.", order: 4 },
    { topicId: t12_5.id, type: "fill_in_blank", difficulty: "intermediate", question: "Please ___ ___ your phone number so I don't forget it.", correctAnswer: "write down", explanation: "'Write down' = make a note of something.", order: 5 },
    { topicId: t12_5.id, type: "error_correction", difficulty: "intermediate", question: "She pointed several errors out the report.", correctAnswer: "She pointed out several errors in the report.", explanation: "'Point out' is typically not separated when the object is long: 'pointed out several errors'.", order: 6 },
    { topicId: t12_5.id, type: "error_correction", difficulty: "intermediate", question: "I'll call back you later.", correctAnswer: "I'll call you back later.", explanation: "With pronouns, separate the phrasal verb: 'call you back', not 'call back you'.", order: 7 },
    { topicId: t12_5.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Rewrite using a phrasal verb: 'She rejected the invitation.'", correctAnswer: "She turned down the invitation.", explanation: "'Turn down' = reject/refuse.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  console.log("  Category 12: Phrasal Verbs - 5 topics seeded");

  // ============================================================
  // CATEGORY 13: Prepositions
  // ============================================================
  const cat13 = await db.grammarCategory.create({
    data: { name: "Prepositions", slug: "prepositions", description: "Master prepositions of time, place, direction, and dependent prepositions", icon: "MapPin", order: 13 },
  });

  const t13_1 = await db.grammarTopic.create({ data: { categoryId: cat13.id, title: "Prepositions of Time", slug: "prepositions-of-time", description: "Use at, on, in, and other prepositions to talk about time", level: "beginner", order: 1 } });
  await db.grammarLesson.create({ data: { topicId: t13_1.id, content: `# Prepositions of Time

## AT — specific times and periods
- **at** 5 o'clock, **at** noon, **at** midnight, **at** night
- **at** the weekend (British English), **at** Christmas, **at** the moment

## ON — days and dates
- **on** Monday, **on** Friday morning, **on** the 5th of May
- **on** my birthday, **on** New Year's Day, **on** weekdays

## IN — longer periods
- **in** the morning/afternoon/evening (BUT at night)
- **in** January, **in** summer, **in** 2024, **in** the 21st century
- **in** + time period (future): **in** five minutes, **in** two weeks

## Other Time Prepositions
- **for** + duration: I studied **for** three hours.
- **since** + starting point: I've lived here **since** 2020.
- **during** + noun: I fell asleep **during** the movie.
- **by** + deadline: Finish **by** Friday. (= no later than)
- **until/till** + end point: Wait **until** 5 PM.
- **from...to/until:** Open **from** 9 AM **to** 5 PM.
- **before/after:** Come **before** 6 PM. We left **after** dinner.`, examples: JSON.stringify(["The meeting is **at** 3 PM.", "She was born **on** July 15th.", "We go on vacation **in** August.", "I've been waiting **for** an hour.", "She has lived here **since** 2018.", "Please finish the report **by** Friday."]), tips: "Think of it as: AT a point (at 3 PM), ON a surface/day (on Monday), IN an area/period (in summer). The most common mistake: 'at night' NOT 'in the night'. Also: 'in the morning' BUT 'on Monday morning'." } });
  for (const ex of [
    { topicId: t13_1.id, type: "multiple_choice", difficulty: "beginner", question: "The class starts ___ 9 AM.", options: JSON.stringify(["in", "on", "at", "by"]), correctAnswer: "at", explanation: "Use 'at' with specific clock times: at 9 AM, at noon, at midnight.", order: 1 },
    { topicId: t13_1.id, type: "multiple_choice", difficulty: "beginner", question: "I was born ___ March.", options: JSON.stringify(["at", "on", "in", "by"]), correctAnswer: "in", explanation: "Use 'in' with months: in March, in January, in December.", order: 2 },
    { topicId: t13_1.id, type: "multiple_choice", difficulty: "beginner", question: "We have a meeting ___ Friday.", options: JSON.stringify(["at", "on", "in", "for"]), correctAnswer: "on", explanation: "Use 'on' with days: on Friday, on Monday, on the weekend (American English).", order: 3 },
    { topicId: t13_1.id, type: "fill_in_blank", difficulty: "beginner", question: "I've been studying English ___ three years.", correctAnswer: "for", explanation: "'For' + duration (three years, two hours, a long time).", order: 4 },
    { topicId: t13_1.id, type: "fill_in_blank", difficulty: "beginner", question: "She has worked here ___ 2019.", correctAnswer: "since", explanation: "'Since' + starting point in time (2019, Monday, last summer).", order: 5 },
    { topicId: t13_1.id, type: "error_correction", difficulty: "beginner", question: "I usually wake up in 7 AM.", correctAnswer: "I usually wake up at 7 AM.", explanation: "Use 'at' with specific times, not 'in'.", order: 6 },
    { topicId: t13_1.id, type: "error_correction", difficulty: "beginner", question: "She was born in 15th May.", correctAnswer: "She was born on the 15th of May.", explanation: "Use 'on' with specific dates, not 'in'.", order: 7 },
    { topicId: t13_1.id, type: "sentence_rewrite", difficulty: "beginner", question: "Add the correct preposition: 'The store opens ___ 8 AM ___ Monday ___ the morning.'", correctAnswer: "The store opens at 8 AM on Monday in the morning.", explanation: "At + time, on + day, in + part of day. But note: 'on Monday morning' is also correct.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  const t13_2 = await db.grammarTopic.create({ data: { categoryId: cat13.id, title: "Prepositions of Place", slug: "prepositions-of-place", description: "Use at, on, in, and other prepositions to describe location", level: "beginner", order: 2 } });
  await db.grammarLesson.create({ data: { topicId: t13_2.id, content: `# Prepositions of Place

## AT — specific point/location
- **at** home, **at** work, **at** school, **at** the bus stop
- **at** the door, **at** the top, **at** the end of the street

## ON — surface/line
- **on** the table, **on** the wall, **on** the floor
- **on** the left/right, **on** the first floor
- **on** a bus/train/plane (public transport)

## IN — enclosed space/area
- **in** the room, **in** the box, **in** the car
- **in** Istanbul, **in** Turkey, **in** the garden
- **in** the newspaper, **in** a book, **in** a photo

## Other Place Prepositions
- **between** = in the middle of two: The shop is **between** the bank and the pharmacy.
- **among** = in the middle of many: She was **among** friends.
- **next to / beside** = at the side of
- **behind** / **in front of** = back / front
- **above** / **below** = higher / lower
- **opposite** = facing, on the other side
- **near / close to** = not far from`, examples: JSON.stringify(["She is **at** home.", "The book is **on** the shelf.", "He is **in** the kitchen.", "The bank is **between** the shop and the school.", "There's a park **behind** the building.", "She sat **next to** me in class."]), tips: "AT = a specific point, ON = a surface/line, IN = inside something. 'At the bus stop' (a point), 'on the bus' (on the surface/inside public transport), 'in the car' (inside a car — small personal vehicle)." } });
  for (const ex of [
    { topicId: t13_2.id, type: "multiple_choice", difficulty: "beginner", question: "The cat is ___ the box.", options: JSON.stringify(["at", "on", "in", "by"]), correctAnswer: "in", explanation: "A box is an enclosed space. Use 'in' for inside spaces.", order: 1 },
    { topicId: t13_2.id, type: "multiple_choice", difficulty: "beginner", question: "She is waiting ___ the bus stop.", options: JSON.stringify(["in", "on", "at", "by"]), correctAnswer: "at", explanation: "A bus stop is a specific point. Use 'at' for specific points/locations.", order: 2 },
    { topicId: t13_2.id, type: "multiple_choice", difficulty: "beginner", question: "There is a picture ___ the wall.", options: JSON.stringify(["at", "on", "in", "by"]), correctAnswer: "on", explanation: "A wall is a surface. Use 'on' for surfaces.", order: 3 },
    { topicId: t13_2.id, type: "fill_in_blank", difficulty: "beginner", question: "The pharmacy is ___ the bank and the supermarket.", correctAnswer: "between", explanation: "'Between' is used when something is in the middle of two things.", order: 4 },
    { topicId: t13_2.id, type: "fill_in_blank", difficulty: "beginner", question: "He lives ___ Istanbul.", correctAnswer: "in", explanation: "Cities are areas/enclosed spaces. Use 'in' with cities, countries, and continents.", order: 5 },
    { topicId: t13_2.id, type: "error_correction", difficulty: "beginner", question: "She is sitting in the bus.", correctAnswer: "She is sitting on the bus.", explanation: "For public transport (bus, train, plane), use 'on'. For cars and taxis, use 'in'.", order: 6 },
    { topicId: t13_2.id, type: "error_correction", difficulty: "beginner", question: "He is at the kitchen cooking dinner.", correctAnswer: "He is in the kitchen cooking dinner.", explanation: "The kitchen is an enclosed space/room. Use 'in', not 'at'.", order: 7 },
    { topicId: t13_2.id, type: "sentence_rewrite", difficulty: "beginner", question: "Describe the location: 'Book → table.'", correctAnswer: "The book is on the table.", explanation: "The table is a surface. Use 'on' for objects resting on surfaces.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  const t13_3 = await db.grammarTopic.create({ data: { categoryId: cat13.id, title: "Prepositions of Direction", slug: "prepositions-of-direction", description: "Use prepositions to describe movement and direction", level: "beginner", order: 3 } });
  await db.grammarLesson.create({ data: { topicId: t13_3.id, content: `# Prepositions of Direction

Prepositions of direction show movement from one place to another.

## Common Direction Prepositions
- **to** = toward a destination: I went **to** school.
- **into** = entering an enclosed space: She walked **into** the room.
- **out of** = leaving an enclosed space: He ran **out of** the building.
- **onto** = moving to a surface: The cat jumped **onto** the table.
- **off** = leaving a surface: Take your feet **off** the table.
- **through** = from one side to the other (inside): We drove **through** the tunnel.
- **across** = from one side to the other (surface): She walked **across** the bridge.
- **along** = following a line: We walked **along** the river.
- **toward(s)** = in the direction of: He walked **toward** the door.
- **past** = going by: She drove **past** the school.
- **up / down** = higher / lower: He climbed **up** the stairs.
- **around** = in a circular direction: They walked **around** the lake.

## To vs At
- **to** = movement/direction: I go **to** school. (moving)
- **at** = location (no movement): I am **at** school. (already there)`, examples: JSON.stringify(["She walked **into** the room.", "The bird flew **out of** the cage.", "We drove **through** the city center.", "He walked **across** the street.", "They ran **toward** the finish line.", "She walked **past** the shop without stopping."]), tips: "Think of INTO as entering (going in) and OUT OF as exiting (going out). INTO a room, OUT OF a building. ONTO a surface, OFF a surface. THROUGH something with an inside (tunnel), ACROSS something flat (bridge, street)." } });
  for (const ex of [
    { topicId: t13_3.id, type: "multiple_choice", difficulty: "beginner", question: "She walked ___ the room and sat down.", options: JSON.stringify(["in", "into", "onto", "to"]), correctAnswer: "into", explanation: "'Into' shows movement entering an enclosed space.", order: 1 },
    { topicId: t13_3.id, type: "multiple_choice", difficulty: "beginner", question: "We drove ___ the tunnel.", options: JSON.stringify(["across", "through", "along", "over"]), correctAnswer: "through", explanation: "'Through' = from one side to the other inside something (a tunnel has an inside).", order: 2 },
    { topicId: t13_3.id, type: "multiple_choice", difficulty: "beginner", question: "The children ran ___ the street to the park.", options: JSON.stringify(["through", "across", "along", "into"]), correctAnswer: "across", explanation: "'Across' = from one side to the other on a surface (a street is flat).", order: 3 },
    { topicId: t13_3.id, type: "fill_in_blank", difficulty: "beginner", question: "He climbed ___ the stairs to the second floor.", correctAnswer: "up", explanation: "'Up' shows upward movement: up the stairs, up the hill.", order: 4 },
    { topicId: t13_3.id, type: "fill_in_blank", difficulty: "beginner", question: "The cat jumped ___ the table.", correctAnswer: "onto|off", explanation: "'Onto' = moving to a surface. 'Off' = leaving a surface. Both work depending on context.", order: 5 },
    { topicId: t13_3.id, type: "error_correction", difficulty: "beginner", question: "She walked in the room.", correctAnswer: "She walked into the room.", explanation: "For movement/entering, use 'into'. 'In' indicates location (already inside), not movement.", order: 6 },
    { topicId: t13_3.id, type: "error_correction", difficulty: "beginner", question: "He drove through the bridge.", correctAnswer: "He drove across the bridge.", explanation: "A bridge is flat/open, not enclosed. Use 'across' for flat surfaces, 'through' for enclosed spaces.", order: 7 },
    { topicId: t13_3.id, type: "sentence_rewrite", difficulty: "beginner", question: "Describe the movement: 'Bird leaves cage.'", correctAnswer: "The bird flew out of the cage.", explanation: "'Out of' describes movement leaving an enclosed space.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  const t13_4 = await db.grammarTopic.create({ data: { categoryId: cat13.id, title: "Dependent Prepositions", slug: "dependent-prepositions", description: "Learn which prepositions follow specific verbs, adjectives, and nouns", level: "advanced", order: 4 } });
  await db.grammarLesson.create({ data: { topicId: t13_4.id, content: `# Dependent Prepositions

Some verbs, adjectives, and nouns are always followed by specific prepositions. These must be memorized.

## Verb + Preposition
- **depend on**: It **depends on** the weather.
- **listen to**: She **listens to** music.
- **wait for**: I'm **waiting for** the bus.
- **look at**: **Look at** this picture.
- **apologize for**: He **apologized for** being late.
- **believe in**: I **believe in** you.
- **belong to**: This book **belongs to** me.
- **suffer from**: She **suffers from** headaches.
- **succeed in**: He **succeeded in** passing the exam.
- **complain about**: They **complained about** the noise.

## Adjective + Preposition
- **good/bad at**: She is **good at** math.
- **interested in**: I'm **interested in** history.
- **afraid of**: He's **afraid of** spiders.
- **proud of**: I'm **proud of** you.
- **responsible for**: Who is **responsible for** this?
- **different from**: This is **different from** that.
- **similar to**: Your bag is **similar to** mine.
- **married to**: She is **married to** a doctor.
- **tired of**: I'm **tired of** waiting.
- **worried about**: She is **worried about** the exam.

## Noun + Preposition
- **reason for**: What is the **reason for** the delay?
- **advantage of**: The **advantage of** living here is the weather.
- **solution to**: We found a **solution to** the problem.`, examples: JSON.stringify(["She **depends on** her parents for support.", "I'm **interested in** learning Turkish.", "He's **afraid of** flying.", "We're **proud of** our students.", "This is **different from** what I expected.", "The **reason for** the delay was traffic."]), tips: "Dependent prepositions are one of the hardest things for ESL learners because there is no logical rule — you just have to memorize which preposition goes with which word. Make flashcards: 'interested IN', 'good AT', 'afraid OF', 'worried ABOUT'." } });
  for (const ex of [
    { topicId: t13_4.id, type: "multiple_choice", difficulty: "advanced", question: "She is very good ___ mathematics.", options: JSON.stringify(["in", "at", "on", "with"]), correctAnswer: "at", explanation: "The fixed combination is 'good at' (a skill or subject).", order: 1 },
    { topicId: t13_4.id, type: "multiple_choice", difficulty: "advanced", question: "I'm interested ___ learning new languages.", options: JSON.stringify(["at", "on", "in", "about"]), correctAnswer: "in", explanation: "The fixed combination is 'interested in'.", order: 2 },
    { topicId: t13_4.id, type: "multiple_choice", difficulty: "advanced", question: "This painting is different ___ the others.", options: JSON.stringify(["from", "to", "than", "of"]), correctAnswer: "from", explanation: "The standard combination is 'different from' (also 'different to' in British English).", order: 3 },
    { topicId: t13_4.id, type: "fill_in_blank", difficulty: "advanced", question: "The success of the project depends ___ teamwork.", correctAnswer: "on", explanation: "The fixed combination is 'depend on'.", order: 4 },
    { topicId: t13_4.id, type: "fill_in_blank", difficulty: "advanced", question: "He apologized ___ arriving late.", correctAnswer: "for", explanation: "The fixed combination is 'apologize for' (+ gerund or noun).", order: 5 },
    { topicId: t13_4.id, type: "error_correction", difficulty: "advanced", question: "She is married with a doctor.", correctAnswer: "She is married to a doctor.", explanation: "The correct combination is 'married to', not 'married with'.", order: 6 },
    { topicId: t13_4.id, type: "error_correction", difficulty: "advanced", question: "I'm worried for the exam results.", correctAnswer: "I'm worried about the exam results.", explanation: "The correct combination is 'worried about', not 'worried for'.", order: 7 },
    { topicId: t13_4.id, type: "sentence_rewrite", difficulty: "advanced", question: "Complete: 'She ___ (proud) her daughter's achievements.'", correctAnswer: "She is proud of her daughter's achievements.", explanation: "The fixed combination is 'proud of'.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  console.log("  Category 13: Prepositions - 4 topics seeded");

  // ============================================================
  // CATEGORY 14: Conjunctions
  // ============================================================
  const cat14 = await db.grammarCategory.create({
    data: { name: "Conjunctions", slug: "conjunctions", description: "Connect words, phrases, and clauses effectively", icon: "Link", order: 14 },
  });

  const t14_1 = await db.grammarTopic.create({ data: { categoryId: cat14.id, title: "Coordinating Conjunctions (FANBOYS)", slug: "coordinating-conjunctions", description: "Connect equal elements with for, and, nor, but, or, yet, so", level: "beginner", order: 1 } });
  await db.grammarLesson.create({ data: { topicId: t14_1.id, content: `# Coordinating Conjunctions (FANBOYS)

Coordinating conjunctions connect words, phrases, or independent clauses of equal importance.

## The Seven Coordinating Conjunctions: FANBOYS
- **F**or = reason (because): She stayed home, **for** she was ill.
- **A**nd = addition: I like tea **and** coffee.
- **N**or = negative addition: She can't sing, **nor** can she dance.
- **B**ut = contrast: He is smart **but** lazy.
- **O**r = alternative: Tea **or** coffee?
- **Y**et = contrast/surprise: She is young, **yet** very wise.
- **S**o = result/consequence: It rained, **so** we stayed home.

## Punctuation Rules
- Connecting two independent clauses: use a **comma** before the conjunction.
  - I like chocolate**,** but I don't eat it often.
- Connecting words or phrases: **no comma** needed.
  - I like chocolate **and** cake. (no comma)

## Special Notes on 'Nor'
After 'nor', the subject and auxiliary verb are inverted:
- She doesn't like fish, **nor does she** like meat.
- He can't swim, **nor can he** ride a bicycle.`, examples: JSON.stringify(["I wanted to go, **but** it was too late. (contrast)", "She speaks English **and** Turkish. (addition)", "Do you want tea **or** coffee? (alternative)", "He studied hard, **so** he passed. (result)", "The food was expensive, **yet** delicious. (contrast/surprise)", "She doesn't eat meat, **nor** does she eat fish. (negative addition)"]), tips: "Use the FANBOYS mnemonic: For, And, Nor, But, Or, Yet, So. Remember the comma rule: comma before FANBOYS when joining two complete sentences, but NO comma when joining words or phrases." } });
  for (const ex of [
    { topicId: t14_1.id, type: "multiple_choice", difficulty: "beginner", question: "She was tired, ___ she kept working.", options: JSON.stringify(["and", "but", "so", "for"]), correctAnswer: "but", explanation: "'But' shows contrast: she was tired (expected to stop) yet she continued.", order: 1 },
    { topicId: t14_1.id, type: "multiple_choice", difficulty: "beginner", question: "It was raining, ___ we stayed indoors.", options: JSON.stringify(["but", "or", "so", "yet"]), correctAnswer: "so", explanation: "'So' shows result/consequence: it rained (cause) → we stayed indoors (result).", order: 2 },
    { topicId: t14_1.id, type: "multiple_choice", difficulty: "beginner", question: "Do you want pizza ___ pasta?", options: JSON.stringify(["and", "but", "or", "so"]), correctAnswer: "or", explanation: "'Or' presents a choice between alternatives.", order: 3 },
    { topicId: t14_1.id, type: "fill_in_blank", difficulty: "beginner", question: "She speaks French ___ German.", correctAnswer: "and", explanation: "'And' adds items together: French + German.", order: 4 },
    { topicId: t14_1.id, type: "fill_in_blank", difficulty: "beginner", question: "He was poor, ___ very happy.", correctAnswer: "yet|but", explanation: "'Yet' or 'but' shows contrast between being poor and being happy.", order: 5 },
    { topicId: t14_1.id, type: "error_correction", difficulty: "beginner", question: "I wanted to go but, it was too late.", correctAnswer: "I wanted to go, but it was too late.", explanation: "The comma goes BEFORE the conjunction, not after it.", order: 6 },
    { topicId: t14_1.id, type: "error_correction", difficulty: "beginner", question: "She doesn't like fish, nor she likes meat.", correctAnswer: "She doesn't like fish, nor does she like meat.", explanation: "After 'nor', invert the subject and auxiliary: 'nor does she'.", order: 7 },
    { topicId: t14_1.id, type: "sentence_rewrite", difficulty: "beginner", question: "Combine: 'It was cold. We went for a walk.' (contrast)", correctAnswer: "It was cold, but we went for a walk.|It was cold, yet we went for a walk.", explanation: "'But' or 'yet' shows contrast between the cold weather and the decision to walk.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  const t14_2 = await db.grammarTopic.create({ data: { categoryId: cat14.id, title: "Subordinating Conjunctions", slug: "subordinating-conjunctions", description: "Create complex sentences by connecting dependent and independent clauses", level: "intermediate", order: 2 } });
  await db.grammarLesson.create({ data: { topicId: t14_2.id, content: `# Subordinating Conjunctions

Subordinating conjunctions connect a dependent (subordinate) clause to an independent clause.

## Categories

### Time
- **when, while, before, after, since, until, as soon as, by the time, whenever**
- I'll call you **when** I arrive.

### Reason/Cause
- **because, since, as**
- She left early **because** she was tired.

### Condition
- **if, unless, provided that, as long as, in case**
- **If** you study, you will pass.

### Contrast
- **although, though, even though, whereas, while**
- **Although** he is rich, he is not happy.

### Purpose
- **so that, in order that**
- She saved money **so that** she could travel.

### Result
- **so...that, such...that**
- It was **so** cold **that** we stayed inside.

## Punctuation
- Dependent clause first → comma: **Because it rained,** we stayed home.
- Dependent clause second → usually no comma: We stayed home **because it rained**.`, examples: JSON.stringify(["**Before** you leave, turn off the lights.", "She left **because** she had an appointment.", "**If** you need help, call me.", "**Although** it was expensive, I bought it.", "He studied hard **so that** he could pass.", "I'll wait **until** you're ready."]), tips: "After time conjunctions (when, before, after, as soon as, until), use present tense for future events: 'I'll call you WHEN I arrive' (NOT 'when I will arrive'). This is a very common rule that students often forget!" } });
  for (const ex of [
    { topicId: t14_2.id, type: "multiple_choice", difficulty: "intermediate", question: "I'll wait ___ you're ready.", options: JSON.stringify(["because", "although", "until", "so that"]), correctAnswer: "until", explanation: "'Until' = up to the point in time when. I'll wait continuously until you're ready.", order: 1 },
    { topicId: t14_2.id, type: "multiple_choice", difficulty: "intermediate", question: "___ she was tired, she kept working.", options: JSON.stringify(["Because", "Although", "If", "Until"]), correctAnswer: "Although", explanation: "'Although' shows contrast: despite being tired, she continued.", order: 2 },
    { topicId: t14_2.id, type: "multiple_choice", difficulty: "intermediate", question: "Take an umbrella ___ it rains.", options: JSON.stringify(["so that", "in case", "because", "although"]), correctAnswer: "in case", explanation: "'In case' = as a precaution for a possible future event.", order: 3 },
    { topicId: t14_2.id, type: "fill_in_blank", difficulty: "intermediate", question: "She studies hard ___ she wants to get good grades.", correctAnswer: "because|since|as", explanation: "Reason conjunctions explain why: because/since/as.", order: 4 },
    { topicId: t14_2.id, type: "fill_in_blank", difficulty: "intermediate", question: "I'll call you ___ ___ ___ I arrive.", correctAnswer: "as soon as", explanation: "'As soon as' = immediately when.", order: 5 },
    { topicId: t14_2.id, type: "error_correction", difficulty: "intermediate", question: "I will call you when I will arrive.", correctAnswer: "I will call you when I arrive.", explanation: "After time conjunctions (when, before, after, as soon as), use present tense, not 'will'.", order: 6 },
    { topicId: t14_2.id, type: "error_correction", difficulty: "intermediate", question: "Although she was tired, but she continued.", correctAnswer: "Although she was tired, she continued.", explanation: "'Although' and 'but' both show contrast. Using both is redundant. Remove one.", order: 7 },
    { topicId: t14_2.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Combine: 'She was sick. She went to work.' (contrast)", correctAnswer: "Although she was sick, she went to work.|She went to work although she was sick.", explanation: "'Although' introduces a concession/contrast clause.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  const t14_3 = await db.grammarTopic.create({ data: { categoryId: cat14.id, title: "Correlative Conjunctions", slug: "correlative-conjunctions", description: "Use conjunction pairs like both...and, either...or, neither...nor", level: "intermediate", order: 3 } });
  await db.grammarLesson.create({ data: { topicId: t14_3.id, content: `# Correlative Conjunctions

Correlative conjunctions work in pairs to connect balanced elements.

## Common Pairs
- **both...and** = addition (inclusive): She speaks **both** English **and** French.
- **either...or** = choice (one or the other): **Either** you come with us, **or** you stay home.
- **neither...nor** = negative (none of them): **Neither** Tom **nor** Jerry passed.
- **not only...but also** = emphasis (and more): She is **not only** smart **but also** kind.
- **whether...or** = alternatives: I don't know **whether** to go **or** stay.

## Subject-Verb Agreement
- **Both...and** = always plural verb: Both he **and** she **are** coming.
- **Either...or / Neither...nor** = verb agrees with the nearest subject:
  - Either the students **or** the teacher **is** responsible.
  - Neither the teacher **nor** the students **are** responsible.
- **Not only...but also** = verb agrees with the nearest subject.

## Parallelism
The elements connected must be the same grammatical form:
- Both **smart** and **kind**. (adjective + adjective)
- Either **go** or **stay**. (verb + verb)
- Not only **in summer** but also **in winter**. (prepositional phrase + prepositional phrase)`, examples: JSON.stringify(["She speaks **both** English **and** Turkish.", "**Either** you apologize, **or** I'm leaving.", "**Neither** the food **nor** the service was good.", "He is **not only** a teacher **but also** a writer.", "I don't know **whether** to laugh **or** to cry.", "**Both** my mother **and** my father are teachers."]), tips: "Make sure the elements after each part of the pair are parallel (same form). Wrong: 'She not only sings but also is dancing.' Right: 'She not only sings but also dances.' (verb + verb)" } });
  for (const ex of [
    { topicId: t14_3.id, type: "multiple_choice", difficulty: "intermediate", question: "She speaks ___ English ___ Turkish fluently.", options: JSON.stringify(["both / and", "either / or", "neither / nor", "whether / or"]), correctAnswer: "both / and", explanation: "'Both...and' includes both: she speaks English AND Turkish.", order: 1 },
    { topicId: t14_3.id, type: "multiple_choice", difficulty: "intermediate", question: "___ the food ___ the service was satisfactory.", options: JSON.stringify(["Both / and", "Either / or", "Neither / nor", "Not only / but also"]), correctAnswer: "Neither / nor", explanation: "'Neither...nor' = not the food, not the service. Both were unsatisfactory.", order: 2 },
    { topicId: t14_3.id, type: "multiple_choice", difficulty: "intermediate", question: "He is ___ intelligent ___ hardworking.", options: JSON.stringify(["both / or", "not only / but also", "either / and", "neither / but"]), correctAnswer: "not only / but also", explanation: "'Not only...but also' adds emphasis: he is intelligent AND (additionally) hardworking.", order: 3 },
    { topicId: t14_3.id, type: "fill_in_blank", difficulty: "intermediate", question: "___ you finish your homework, ___ you can't go out.", options: JSON.stringify(["Either / or"]), correctAnswer: "Either ... or", explanation: "'Either...or' presents two alternatives.", order: 4 },
    { topicId: t14_3.id, type: "fill_in_blank", difficulty: "intermediate", question: "I like ___ tea ___ coffee. I prefer juice.", correctAnswer: "neither ... nor", explanation: "'Neither...nor' negates both options.", order: 5 },
    { topicId: t14_3.id, type: "error_correction", difficulty: "intermediate", question: "I like both tea or coffee.", correctAnswer: "I like both tea and coffee.", explanation: "The pair is 'both...and', not 'both...or'.", order: 6 },
    { topicId: t14_3.id, type: "error_correction", difficulty: "intermediate", question: "Neither the teacher nor the students was ready.", correctAnswer: "Neither the teacher nor the students were ready.", explanation: "With 'neither...nor', the verb agrees with the nearest subject. 'Students' (plural) → 'were'.", order: 7 },
    { topicId: t14_3.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Combine: 'She is smart. She is also kind.' (emphasis)", correctAnswer: "She is not only smart but also kind.", explanation: "'Not only...but also' adds emphasis to both qualities.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  console.log("  Category 14: Conjunctions - 3 topics seeded");

  // ============================================================
  // CATEGORY 15: Punctuation
  // ============================================================
  const cat15 = await db.grammarCategory.create({
    data: { name: "Punctuation", slug: "punctuation", description: "Use punctuation marks correctly to clarify meaning", icon: "PenTool", order: 15 },
  });

  const t15_1 = await db.grammarTopic.create({ data: { categoryId: cat15.id, title: "Commas", slug: "commas", description: "Master the essential rules for using commas", level: "intermediate", order: 1 } });
  await db.grammarLesson.create({ data: { topicId: t15_1.id, content: `# Commas

The comma is the most frequently used punctuation mark. It separates elements within a sentence for clarity.

## Essential Comma Rules

### 1. Lists (Serial Comma / Oxford Comma)
Separate three or more items: I bought apples**,** bananas**,** and oranges.

### 2. Before Coordinating Conjunctions (FANBOYS)
When joining two independent clauses: She was tired**,** but she kept working.

### 3. After Introductory Elements
- After introductory clauses: **After the movie,** we went home.
- After introductory words: **However,** I disagree.
- After introductory phrases: **In my opinion,** this is wrong.

### 4. Non-Essential Information (Appositives)
Set off extra information with commas: My sister**,** who lives in London**,** is a doctor.

### 5. Direct Address
When addressing someone by name: **John,** can you help me?

### 6. Dates and Addresses
- May 15**,** 2024
- Istanbul**,** Turkey

## When NOT to Use Commas
- Between subject and verb: ~~The tall man, ran away.~~
- Before 'that' in essential clauses: The book that I bought is good. (no comma)
- After 'and' at the end of a list: I bought apples, bananas, and oranges. (not: and, oranges)`, examples: JSON.stringify(["I need eggs**,** milk**,** and bread. (list)", "She was tired**,** so she went to bed. (FANBOYS)", "**After dinner,** we watched a movie. (introductory clause)", "My brother**,** who is 30**,** lives in Ankara. (non-essential info)", "**Sarah,** please close the door. (direct address)", "The meeting is on March 5**,** 2024. (date)"]), tips: "When in doubt about a comma, read the sentence aloud. Where you naturally pause, a comma might be needed. But remember: not every pause needs a comma, and not every comma represents a spoken pause." } });
  for (const ex of [
    { topicId: t15_1.id, type: "multiple_choice", difficulty: "intermediate", question: "Which needs a comma?", options: JSON.stringify(["She likes dogs and cats.", "She likes dogs but she doesn't like cats.", "She likes big dogs.", "She likes to read."]), correctAnswer: "She likes dogs but she doesn't like cats.", explanation: "A comma is needed before 'but' when it joins two independent clauses: 'She likes dogs, but she doesn't like cats.'", order: 1 },
    { topicId: t15_1.id, type: "multiple_choice", difficulty: "intermediate", question: "Where should commas go? 'My friend who lives in Paris is visiting me.'", options: JSON.stringify(["No commas needed — it's a defining clause.", "My friend, who lives in Paris, is visiting me.", "My, friend who lives in Paris is visiting me.", "My friend who lives in Paris, is visiting me."]), correctAnswer: "My friend, who lives in Paris, is visiting me.", explanation: "If 'my friend' already identifies the person, 'who lives in Paris' is extra info and needs commas.", order: 2 },
    { topicId: t15_1.id, type: "multiple_choice", difficulty: "intermediate", question: "Which is punctuated correctly?", options: JSON.stringify(["After the movie we went home.", "After the movie, we went home.", "After, the movie we went home.", "After the movie we, went home."]), correctAnswer: "After the movie, we went home.", explanation: "Use a comma after an introductory clause or phrase.", order: 3 },
    { topicId: t15_1.id, type: "fill_in_blank", difficulty: "intermediate", question: "I need to buy eggs___ milk___ bread___ and butter.", correctAnswer: ", ... , ... ,", explanation: "Use commas to separate items in a list. The Oxford comma before 'and' is recommended.", order: 4 },
    { topicId: t15_1.id, type: "fill_in_blank", difficulty: "intermediate", question: "___John___ can you help me with this?", correctAnswer: "... , ...", explanation: "Use a comma after a name in direct address.", order: 5 },
    { topicId: t15_1.id, type: "error_correction", difficulty: "intermediate", question: "The tall man, ran down the street.", correctAnswer: "The tall man ran down the street.", explanation: "Never put a comma between the subject and its verb.", order: 6 },
    { topicId: t15_1.id, type: "error_correction", difficulty: "intermediate", question: "She was tired but she kept working.", correctAnswer: "She was tired, but she kept working.", explanation: "When 'but' joins two independent clauses, a comma is needed before it.", order: 7 },
    { topicId: t15_1.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Add commas: 'Although it was raining we went for a walk and had a great time.'", correctAnswer: "Although it was raining, we went for a walk and had a great time.", explanation: "Comma after the introductory 'although' clause. No comma before 'and' here because it joins a verb phrase, not two independent clauses.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  const t15_2 = await db.grammarTopic.create({ data: { categoryId: cat15.id, title: "Semicolons & Colons", slug: "semicolons-and-colons", description: "Use semicolons and colons to connect and introduce ideas", level: "advanced", order: 2 } });
  await db.grammarLesson.create({ data: { topicId: t15_2.id, content: `# Semicolons & Colons

## Semicolons (;)

### 1. Connect Related Independent Clauses
Instead of a period or conjunction: She loves cooking**;** her brother prefers eating out.

### 2. Before Conjunctive Adverbs
however, therefore, moreover, furthermore, nevertheless, consequently, meanwhile
- She studied hard**;** however**,** she didn't pass.

### 3. In Complex Lists
When list items contain commas: I've visited Paris**,** France**;** Rome**,** Italy**;** and Tokyo**,** Japan.

## Colons (:)

### 1. Introduce a List
- You need three things**:** eggs, flour, and sugar.

### 2. Introduce an Explanation or Elaboration
- She had one goal**:** to become a doctor.

### 3. Before a Quotation
- He always says**:** "Practice makes perfect."

### 4. In Time
- The meeting is at 2**:**30 PM.

## Semicolon vs Colon
- **Semicolon** = connects two equal, related sentences
- **Colon** = introduces what follows (lists, explanations, elaborations)`, examples: JSON.stringify(["I have a meeting at 9 AM**;** I'll call you after that.", "She was tired**;** therefore**,** she went to bed early.", "I need**:** eggs, butter, flour, and sugar.", "She had one dream**:** to travel the world.", "The bus leaves at 7**:**30 AM.", "I've lived in Istanbul**,** Turkey**;** London**,** UK**;** and Paris**,** France."]), tips: "A semicolon is like a 'soft period' — it separates two complete sentences that are closely related. A colon is like a 'drumroll' — it introduces what comes next (a list, explanation, or quote)." } });
  for (const ex of [
    { topicId: t15_2.id, type: "multiple_choice", difficulty: "advanced", question: "Which is correct?", options: JSON.stringify(["She loves reading, he prefers movies.", "She loves reading; he prefers movies.", "She loves reading: he prefers movies.", "She loves reading. He prefers movies"]), correctAnswer: "She loves reading; he prefers movies.", explanation: "A semicolon connects two related independent clauses without a conjunction.", order: 1 },
    { topicId: t15_2.id, type: "multiple_choice", difficulty: "advanced", question: "Which correctly uses a colon?", options: JSON.stringify(["I need: to go home.", "You need three things: eggs, flour, and sugar.", "She said: that she was tired.", "I went: to the store."]), correctAnswer: "You need three things: eggs, flour, and sugar.", explanation: "A colon introduces a list after a complete clause.", order: 2 },
    { topicId: t15_2.id, type: "multiple_choice", difficulty: "advanced", question: "She was late; ___, she missed the meeting.", options: JSON.stringify(["but", "and", "therefore", "because"]), correctAnswer: "therefore", explanation: "Conjunctive adverbs (therefore, however, moreover) follow a semicolon.", order: 3 },
    { topicId: t15_2.id, type: "fill_in_blank", difficulty: "advanced", question: "She studied hard___ however___ she failed the exam.", correctAnswer: "; ... ,", explanation: "Semicolon before 'however', comma after: 'hard; however, she failed'.", order: 4 },
    { topicId: t15_2.id, type: "fill_in_blank", difficulty: "advanced", question: "He had one goal___ to win the championship.", correctAnswer: ":", explanation: "A colon introduces an explanation or elaboration of the previous clause.", order: 5 },
    { topicId: t15_2.id, type: "error_correction", difficulty: "advanced", question: "I need to buy; eggs, milk, and bread.", correctAnswer: "I need to buy: eggs, milk, and bread.", explanation: "Use a colon (not semicolon) to introduce a list.", order: 6 },
    { topicId: t15_2.id, type: "error_correction", difficulty: "advanced", question: "She was tired, therefore, she went to bed.", correctAnswer: "She was tired; therefore, she went to bed.", explanation: "Use a semicolon before conjunctive adverbs like 'therefore', not a comma (which creates a comma splice).", order: 7 },
    { topicId: t15_2.id, type: "sentence_rewrite", difficulty: "advanced", question: "Combine with a semicolon: 'It was raining. We decided to stay home.'", correctAnswer: "It was raining; we decided to stay home.", explanation: "A semicolon connects two closely related independent clauses.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  const t15_3 = await db.grammarTopic.create({ data: { categoryId: cat15.id, title: "Apostrophes", slug: "apostrophes", description: "Use apostrophes for contractions and possession", level: "beginner", order: 3 } });
  await db.grammarLesson.create({ data: { topicId: t15_3.id, content: `# Apostrophes

Apostrophes have two main uses: contractions and possession.

## 1. Contractions
An apostrophe replaces missing letters:
- I am → I**'m**, you are → you**'re**, he is → he**'s**
- do not → don**'t**, cannot → can**'t**, will not → won**'t**
- I have → I**'ve**, she has → she**'s**, they would → they**'d**

## 2. Possession

### Singular Nouns: add 's
- The dog**'s** bone. Sarah**'s** book. The teacher**'s** desk.

### Plural Nouns ending in -s: add just '
- The dogs**'** bones. The teachers**'** desks. The students**'** books.

### Plural Nouns NOT ending in -s: add 's
- The children**'s** toys. The women**'s** room. The people**'s** choice.

### Names ending in -s: add 's or just ' (both accepted)
- James**'s** car or James**'** car.

## Common Mistakes
- **its** (possessive) vs **it's** (it is/it has): The dog wagged **its** tail. **It's** raining.
- **your** (possessive) vs **you're** (you are)
- **their** (possessive) vs **they're** (they are)
- Do NOT use apostrophes for plurals: ~~apple's for sale~~ → apples for sale`, examples: JSON.stringify(["**It's** a beautiful day. (it is)", "The cat licked **its** paw. (possessive — no apostrophe)", "**Sarah's** car is red. (singular possession)", "The **students'** books are on the desk. (plural possession)", "**I'm** going to the store. (I am)", "The **children's** playground is new. (irregular plural possession)"]), tips: "The #1 apostrophe mistake: its vs it's. ITS (no apostrophe) = possessive (the dog wagged its tail). IT'S (with apostrophe) = it is or it has. If you can replace the word with 'it is', use it's. If not, use its." } });
  for (const ex of [
    { topicId: t15_3.id, type: "multiple_choice", difficulty: "beginner", question: "Which is correct? 'The ___ toy is broken.'", options: JSON.stringify(["dogs", "dog's", "dogs'", "dogs's"]), correctAnswer: "dog's", explanation: "Singular possessive: the dog's toy (one dog owns the toy). Add 's.", order: 1 },
    { topicId: t15_3.id, type: "multiple_choice", difficulty: "beginner", question: "Which is correct? '___ raining outside.'", options: JSON.stringify(["Its", "It's", "Its'", "Its's"]), correctAnswer: "It's", explanation: "'It's' = 'it is'. 'Its' (no apostrophe) is possessive.", order: 2 },
    { topicId: t15_3.id, type: "multiple_choice", difficulty: "beginner", question: "How do you show that multiple students own books?", options: JSON.stringify(["The student's books", "The students' books", "The students's books", "The students books"]), correctAnswer: "The students' books", explanation: "Plural nouns ending in -s: just add an apostrophe after the -s.", order: 3 },
    { topicId: t15_3.id, type: "fill_in_blank", difficulty: "beginner", question: "The ___ toys are all over the floor. (children)", correctAnswer: "children's", explanation: "Irregular plurals not ending in -s get 's: children's.", order: 4 },
    { topicId: t15_3.id, type: "fill_in_blank", difficulty: "beginner", question: "I ___ seen that movie yet. (have not)", correctAnswer: "haven't", explanation: "Contraction of 'have not' = haven't. The apostrophe replaces the 'o'.", order: 5 },
    { topicId: t15_3.id, type: "error_correction", difficulty: "beginner", question: "The cat licked it's paw.", correctAnswer: "The cat licked its paw.", explanation: "'Its' (possessive) has no apostrophe. 'It's' means 'it is'.", order: 6 },
    { topicId: t15_3.id, type: "error_correction", difficulty: "beginner", question: "Apple's are on sale today.", correctAnswer: "Apples are on sale today.", explanation: "Do not use apostrophes to form plurals. 'Apples' (plural), not 'apple's'.", order: 7 },
    { topicId: t15_3.id, type: "sentence_rewrite", difficulty: "beginner", question: "Rewrite with an apostrophe: 'The car that belongs to my father is blue.'", correctAnswer: "My father's car is blue.", explanation: "Possessive: my father's car = the car belonging to my father.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  const t15_4 = await db.grammarTopic.create({ data: { categoryId: cat15.id, title: "Quotation Marks", slug: "quotation-marks", description: "Correctly punctuate direct speech and special terms", level: "intermediate", order: 4 } });
  await db.grammarLesson.create({ data: { topicId: t15_4.id, content: `# Quotation Marks

Quotation marks enclose direct speech, titles, and special terms.

## Direct Speech
Enclose the exact words someone said:
- She said, **"**I am happy.**"**
- **"**I am happy,**"** she said.
- **"**Are you coming?**"** he asked.

## Punctuation with Quotation Marks
- Comma before quotation: She said**,** "I am tired."
- Period/comma inside quotation marks (American English): "I am tired**,**" she said.
- Question mark inside if the quote is a question: "Are you coming**?**" he asked.
- Question mark outside if the sentence is a question: Did she say "I'm leaving"**?**

## Other Uses
1. **Titles** of short works: articles, chapters, songs, poems, TV episodes
   - Have you read **"**The Lottery**"** by Shirley Jackson?
2. **Ironic or special terms**
   - His **"**friend**"** betrayed him. (suggesting the person isn't really a friend)
3. **Quoted words or phrases**
   - The word **"**serendipity**"** means a happy accident.

## Single vs Double Quotation Marks
- American English: double for primary ("..."), single for quotes within quotes ("She said, 'I am tired.'")
- British English: the opposite convention is also accepted.`, examples: JSON.stringify(["She said, **\"**I love this city.**\"**", "**\"**Where are you going?**\"** he asked.", "**\"**I'll be back,**\"** she promised.", "Have you read the article **\"**Learning English Fast**\"**?", "His so-called **\"**help**\"** only made things worse.", "**\"**She said, 'I'm leaving,'**\"** Tom reported."]), tips: "In American English, commas and periods always go INSIDE quotation marks: 'Hello,' she said. In British English, the rules are more flexible. For exams, follow American English conventions unless told otherwise." } });
  for (const ex of [
    { topicId: t15_4.id, type: "multiple_choice", difficulty: "intermediate", question: "Which is punctuated correctly?", options: JSON.stringify(["She said \"I am tired.\"", "She said, \"I am tired.\"", "She said: \"I am tired\".", "She, said \"I am tired.\""]), correctAnswer: "She said, \"I am tired.\"", explanation: "A comma comes after 'said' and before the opening quotation mark. Period goes inside the quotation marks.", order: 1 },
    { topicId: t15_4.id, type: "multiple_choice", difficulty: "intermediate", question: "Which is correct?", options: JSON.stringify(["\"Are you coming\"? he asked.", "\"Are you coming?\" he asked.", "\"Are you coming?\", he asked.", "\"Are you coming,\" he asked?"]), correctAnswer: "\"Are you coming?\" he asked.", explanation: "The question mark goes inside the quotation marks because the quote itself is a question.", order: 2 },
    { topicId: t15_4.id, type: "multiple_choice", difficulty: "intermediate", question: "When do we use quotation marks for titles?", options: JSON.stringify(["For book titles", "For short work titles (articles, poems)", "For movie titles", "For all titles"]), correctAnswer: "For short work titles (articles, poems)", explanation: "Quotation marks are for short works (articles, chapters, poems, songs). Longer works (books, movies) use italics.", order: 3 },
    { topicId: t15_4.id, type: "fill_in_blank", difficulty: "intermediate", question: "He asked___ ___Where do you live?___", correctAnswer: ", \"...\"", explanation: "Comma after reporting verb, quotation marks around direct speech.", order: 4 },
    { topicId: t15_4.id, type: "fill_in_blank", difficulty: "intermediate", question: "___I'll be there soon___ ___ she promised.", correctAnswer: "\"...,\"", explanation: "The comma goes inside the quotation marks before the closing quote.", order: 5 },
    { topicId: t15_4.id, type: "error_correction", difficulty: "intermediate", question: "She said \"I am happy\".", correctAnswer: "She said, \"I am happy.\"", explanation: "Add a comma after 'said' and put the period inside the quotation marks.", order: 6 },
    { topicId: t15_4.id, type: "error_correction", difficulty: "intermediate", question: "\"I am leaving\", she said.", correctAnswer: "\"I am leaving,\" she said.", explanation: "In American English, the comma goes inside the quotation marks, not outside.", order: 7 },
    { topicId: t15_4.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Add quotation marks: She said I will call you later.", correctAnswer: "She said, \"I will call you later.\"", explanation: "Direct speech is enclosed in quotation marks with a comma after the reporting verb.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  console.log("  Category 15: Punctuation - 4 topics seeded");

  // ============================================================
  // CATEGORY 16: Common Errors
  // ============================================================
  const cat16 = await db.grammarCategory.create({
    data: { name: "Common Errors", slug: "common-errors", description: "Avoid the most frequent mistakes in English", icon: "AlertTriangle", order: 16 },
  });

  const t16_1 = await db.grammarTopic.create({ data: { categoryId: cat16.id, title: "Its vs It's", slug: "its-vs-its", description: "Never confuse the possessive its with the contraction it's again", level: "beginner", order: 1 } });
  await db.grammarLesson.create({ data: { topicId: t16_1.id, content: `# Its vs It's

This is one of the most common errors in English.

## It's = It is / It has (contraction)
- **It's** raining outside. (It is raining.)
- **It's** been a long day. (It has been.)
- **It's** important to study. (It is important.)

## Its = possessive (belonging to it)
- The dog wagged **its** tail. (the tail belonging to the dog)
- The company changed **its** logo. (the logo belonging to the company)
- The tree lost **its** leaves. (the leaves of the tree)

## How to Remember
**Test:** Can you replace the word with "it is" or "it has"?
- YES → use **it's** (with apostrophe)
- NO → use **its** (no apostrophe)

Example: "The cat licked __ paw."
- "The cat licked it is paw." ← Makes no sense → use **its**

Example: "__ going to rain."
- "It is going to rain." ← Makes sense → use **it's**

## Why No Apostrophe for Possessive 'Its'?
Possessive pronouns NEVER have apostrophes: his, hers, ours, theirs, yours, its. The apostrophe in "it's" is only for the contraction.`, examples: JSON.stringify(["**It's** a beautiful day! (it is)", "The bird spread **its** wings. (possessive)", "**It's** been three years since we met. (it has)", "The school updated **its** website. (possessive)", "I think **it's** going to snow. (it is)", "The phone lost **its** charge. (possessive)"]), tips: "Every time you write 'it's' or 'its', do the replacement test: can you say 'it is' instead? If yes, use it's. If no, use its. This simple test eliminates the error 100% of the time." } });
  for (const ex of [
    { topicId: t16_1.id, type: "multiple_choice", difficulty: "beginner", question: "The dog wagged ___ tail.", options: JSON.stringify(["it's", "its", "its'", "it"]), correctAnswer: "its", explanation: "Possessive 'its' (no apostrophe). The tail belongs to the dog. 'It is tail' makes no sense.", order: 1 },
    { topicId: t16_1.id, type: "multiple_choice", difficulty: "beginner", question: "___ raining outside.", options: JSON.stringify(["Its", "It's", "Its'", "Itss"]), correctAnswer: "It's", explanation: "'It's' = 'It is'. 'It is raining outside' makes sense.", order: 2 },
    { topicId: t16_1.id, type: "multiple_choice", difficulty: "beginner", question: "The company lost ___ biggest client.", options: JSON.stringify(["it's", "its", "its'", "it"]), correctAnswer: "its", explanation: "Possessive: the biggest client belonging to the company. 'It is biggest client' doesn't work.", order: 3 },
    { topicId: t16_1.id, type: "fill_in_blank", difficulty: "beginner", question: "___ been a wonderful evening.", correctAnswer: "It's", explanation: "'It's' = 'It has'. 'It has been a wonderful evening.'", order: 4 },
    { topicId: t16_1.id, type: "fill_in_blank", difficulty: "beginner", question: "The city is famous for ___ architecture.", correctAnswer: "its", explanation: "Possessive: the architecture belonging to the city.", order: 5 },
    { topicId: t16_1.id, type: "error_correction", difficulty: "beginner", question: "The cat cleaned it's fur.", correctAnswer: "The cat cleaned its fur.", explanation: "Possessive = 'its' (no apostrophe). The fur belongs to the cat.", order: 6 },
    { topicId: t16_1.id, type: "error_correction", difficulty: "beginner", question: "Its important to be on time.", correctAnswer: "It's important to be on time.", explanation: "'It is important' = 'It's important'. Use the contraction with an apostrophe.", order: 7 },
    { topicId: t16_1.id, type: "sentence_rewrite", difficulty: "beginner", question: "Correct: 'The phone lost it's battery. Its almost dead.'", correctAnswer: "The phone lost its battery. It's almost dead.", explanation: "First 'its' = possessive (battery belongs to phone). Second 'it's' = it is.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  const t16_2 = await db.grammarTopic.create({ data: { categoryId: cat16.id, title: "Their/There/They're", slug: "their-there-theyre", description: "Distinguish between these three commonly confused homophones", level: "beginner", order: 2 } });
  await db.grammarLesson.create({ data: { topicId: t16_2.id, content: `# Their / There / They're

These three words sound the same but have completely different meanings.

## Their = possessive (belonging to them)
- **Their** house is big. (the house belonging to them)
- The students brought **their** books.

## There = a place (opposite of here) / introduction
- The book is over **there**. (location)
- **There** is a cat in the garden. (introducing existence)
- **There** are many reasons to study English.

## They're = they are (contraction)
- **They're** coming to dinner. (they are coming)
- **They're** very kind people. (they are very kind)

## How to Remember
- **Their** = possession (it has "heir" in it — heir = someone who inherits/owns things)
- **There** = place (it has "here" in it — here/there are both places)
- **They're** = they are (it has an apostrophe like all contractions)

## Test
Replace the word:
- Can you replace it with "they are"? → **they're**
- Does it show ownership? → **their**
- Is it about a place or existence? → **there**`, examples: JSON.stringify(["**Their** car is parked outside. (belonging to them)", "The restaurant is over **there**. (place)", "**They're** going to be late. (they are)", "**There** are three books on the table. (existence)", "The children finished **their** homework. (possessive)", "**They're** the best students in the class. (they are)"]), tips: "Quick test: (1) Try replacing with 'they are' — if it works, use 'they're'. (2) If it shows ownership, use 'their'. (3) Otherwise, use 'there'. Practice this test every time you write one of these words." } });
  for (const ex of [
    { topicId: t16_2.id, type: "multiple_choice", difficulty: "beginner", question: "___ going to the park later.", options: JSON.stringify(["Their", "There", "They're"]), correctAnswer: "They're", explanation: "'They're' = 'They are going to the park.' The contraction works here.", order: 1 },
    { topicId: t16_2.id, type: "multiple_choice", difficulty: "beginner", question: "The students forgot ___ books.", options: JSON.stringify(["their", "there", "they're"]), correctAnswer: "their", explanation: "Possessive: the books belonging to the students.", order: 2 },
    { topicId: t16_2.id, type: "multiple_choice", difficulty: "beginner", question: "___ is a supermarket on the corner.", options: JSON.stringify(["Their", "There", "They're"]), correctAnswer: "There", explanation: "'There is/are' introduces the existence of something.", order: 3 },
    { topicId: t16_2.id, type: "fill_in_blank", difficulty: "beginner", question: "I think ___ the best team in the league.", correctAnswer: "they're", explanation: "'They're' = 'they are the best team'.", order: 4 },
    { topicId: t16_2.id, type: "fill_in_blank", difficulty: "beginner", question: "The children are playing over ___.", correctAnswer: "there", explanation: "'There' indicates a place (over there = in that location).", order: 5 },
    { topicId: t16_2.id, type: "error_correction", difficulty: "beginner", question: "Their coming to the party tonight.", correctAnswer: "They're coming to the party tonight.", explanation: "'They're' = 'they are'. 'Their' is possessive and doesn't fit here.", order: 6 },
    { topicId: t16_2.id, type: "error_correction", difficulty: "beginner", question: "The students left they're bags in the classroom.", correctAnswer: "The students left their bags in the classroom.", explanation: "'Their' = possessive (bags belonging to the students). Not 'they're' (they are).", order: 7 },
    { topicId: t16_2.id, type: "sentence_rewrite", difficulty: "beginner", question: "Correct all errors: 'Their going to there house because they're dog is their.'", correctAnswer: "They're going to their house because their dog is there.", explanation: "They're (they are) going to their (possessive) house because their (possessive) dog is there (place).", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  const t16_3 = await db.grammarTopic.create({ data: { categoryId: cat16.id, title: "Your vs You're", slug: "your-vs-youre", description: "Distinguish between the possessive your and the contraction you're", level: "beginner", order: 3 } });
  await db.grammarLesson.create({ data: { topicId: t16_3.id, content: `# Your vs You're

## Your = possessive (belonging to you)
- **Your** book is on the table. (the book belonging to you)
- What is **your** name?
- I like **your** shoes.

## You're = you are (contraction)
- **You're** very kind. (you are very kind)
- **You're** going to love this movie. (you are going)
- I think **you're** right. (you are right)

## The Test
Replace the word with "you are":
- "**You're** late." → "You are late." ← Makes sense → **you're**
- "**Your** bag is heavy." → "You are bag is heavy." ← Nonsense → **your**

## Common Mistakes
- ~~"Your welcome."~~ → **"You're welcome."** (you are welcome)
- ~~"Your the best."~~ → **"You're the best."** (you are the best)
- ~~"You're book"~~ → **"Your book"** (the book belonging to you)`, examples: JSON.stringify(["**You're** the best student in the class! (you are)", "Is this **your** phone? (possessive)", "**You're** going to be late. (you are)", "I love **your** cooking. (possessive)", "**You're** welcome. (you are welcome)", "What's **your** favorite color? (possessive)"]), tips: "The test is simple: if you can replace the word with 'you are' and it still makes sense, use 'you're'. If not, use 'your'. The most common mistake: 'Your welcome' should always be 'You're welcome' (you are welcome)." } });
  for (const ex of [
    { topicId: t16_3.id, type: "multiple_choice", difficulty: "beginner", question: "___ going to love this restaurant.", options: JSON.stringify(["Your", "You're"]), correctAnswer: "You're", explanation: "'You're' = 'You are going to love this restaurant.'", order: 1 },
    { topicId: t16_3.id, type: "multiple_choice", difficulty: "beginner", question: "Is this ___ car?", options: JSON.stringify(["your", "you're"]), correctAnswer: "your", explanation: "Possessive: the car belonging to you. 'You are car' makes no sense.", order: 2 },
    { topicId: t16_3.id, type: "multiple_choice", difficulty: "beginner", question: "Thank you! ___ welcome.", options: JSON.stringify(["Your", "You're"]), correctAnswer: "You're", explanation: "'You're welcome' = 'You are welcome.' This is one of the most common errors.", order: 3 },
    { topicId: t16_3.id, type: "fill_in_blank", difficulty: "beginner", question: "I think ___ making a big mistake.", correctAnswer: "you're", explanation: "'You're' = 'you are making a big mistake.'", order: 4 },
    { topicId: t16_3.id, type: "fill_in_blank", difficulty: "beginner", question: "What is ___ email address?", correctAnswer: "your", explanation: "Possessive: the email address belonging to you.", order: 5 },
    { topicId: t16_3.id, type: "error_correction", difficulty: "beginner", question: "Your the best friend I've ever had.", correctAnswer: "You're the best friend I've ever had.", explanation: "'You're' = 'You are the best friend.' Not possessive.", order: 6 },
    { topicId: t16_3.id, type: "error_correction", difficulty: "beginner", question: "You're jacket is very nice.", correctAnswer: "Your jacket is very nice.", explanation: "Possessive: the jacket belonging to you. 'You are jacket' makes no sense.", order: 7 },
    { topicId: t16_3.id, type: "sentence_rewrite", difficulty: "beginner", question: "Correct: 'Your very talented and you're work is impressive.'", correctAnswer: "You're very talented and your work is impressive.", explanation: "First: 'You're' (you are) talented. Second: 'Your' (possessive) work.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  const t16_4 = await db.grammarTopic.create({ data: { categoryId: cat16.id, title: "Affect vs Effect", slug: "affect-vs-effect", description: "Know when to use the verb affect and the noun effect", level: "intermediate", order: 4 } });
  await db.grammarLesson.create({ data: { topicId: t16_4.id, content: `# Affect vs Effect

## Affect = verb (to influence or produce a change)
- The rain **affected** our plans. (influenced)
- Lack of sleep **affects** your health. (influences)
- She was deeply **affected** by the news. (emotionally influenced)

## Effect = noun (the result or outcome)
- The rain had an **effect** on our plans. (result)
- What are the **effects** of climate change? (results)
- The medicine had a positive **effect**. (outcome)

## Memory Trick: RAVEN
**R**emember: **A**ffect = **V**erb, **E**ffect = **N**oun

## Exceptions (rare)
- **Effect** as a verb (formal): to effect change = to bring about/cause change
  - The new policy **effected** significant changes. (brought about)
- **Affect** as a noun (psychology): emotional state
  - The patient displayed a flat **affect**. (medical term)

These exceptions are rare. In 95% of cases: Affect = verb, Effect = noun.`, examples: JSON.stringify(["The weather **affected** our trip. (verb — influenced)", "The weather had a negative **effect** on our trip. (noun — result)", "How does stress **affect** your body? (verb)", "The **effects** of pollution are serious. (noun)", "The movie deeply **affected** the audience. (verb — moved/influenced)", "The new law will take **effect** next month. (noun — become active)"]), tips: "Use the RAVEN trick: Remember Affect = Verb, Effect = Noun. If you need a verb (doing word), use 'affect'. If you need a noun (naming word), use 'effect'. Test: can you put 'the' before it? 'The effect' works (noun). 'The affect' usually doesn't." } });
  for (const ex of [
    { topicId: t16_4.id, type: "multiple_choice", difficulty: "intermediate", question: "The cold weather ___ the crops.", options: JSON.stringify(["affected", "effected", "effect", "affect"]), correctAnswer: "affected", explanation: "'Affected' is the past tense verb meaning 'influenced'. The weather influenced the crops.", order: 1 },
    { topicId: t16_4.id, type: "multiple_choice", difficulty: "intermediate", question: "What is the ___ of this medicine?", options: JSON.stringify(["affect", "effect", "affected", "effected"]), correctAnswer: "effect", explanation: "'Effect' is the noun meaning 'result/outcome'. We can say 'the effect'.", order: 2 },
    { topicId: t16_4.id, type: "multiple_choice", difficulty: "intermediate", question: "Pollution ___ everyone.", options: JSON.stringify(["effects", "affects", "effect", "effecting"]), correctAnswer: "affects", explanation: "'Affects' is the verb (influences). Pollution influences everyone.", order: 3 },
    { topicId: t16_4.id, type: "fill_in_blank", difficulty: "intermediate", question: "The new policy had a significant ___ on sales.", correctAnswer: "effect", explanation: "'Effect' (noun) with 'a/the' before it: 'a significant effect'.", order: 4 },
    { topicId: t16_4.id, type: "fill_in_blank", difficulty: "intermediate", question: "How does lack of sleep ___ your performance?", correctAnswer: "affect", explanation: "'Affect' (verb) meaning influence. It follows 'does' (auxiliary verb).", order: 5 },
    { topicId: t16_4.id, type: "error_correction", difficulty: "intermediate", question: "The drought had a terrible affect on the farmers.", correctAnswer: "The drought had a terrible effect on the farmers.", explanation: "After 'a terrible' we need a noun: 'effect', not 'affect' (which is usually a verb).", order: 6 },
    { topicId: t16_4.id, type: "error_correction", difficulty: "intermediate", question: "Smoking effects your health badly.", correctAnswer: "Smoking affects your health badly.", explanation: "We need the verb meaning 'influences': 'affects', not 'effects'.", order: 7 },
    { topicId: t16_4.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Use both words correctly: 'How does stress influence health? What are the results?'", correctAnswer: "How does stress affect health? What are the effects?", explanation: "'Affect' = verb (influence). 'Effects' = noun (results).", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  const t16_5 = await db.grammarTopic.create({ data: { categoryId: cat16.id, title: "Subject-Verb Errors", slug: "subject-verb-errors", description: "Identify and fix the most common subject-verb agreement mistakes", level: "intermediate", order: 5 } });
  await db.grammarLesson.create({ data: { topicId: t16_5.id, content: `# Common Subject-Verb Errors

These are the most frequent subject-verb agreement mistakes.

## Error 1: Phrases Between Subject and Verb
The verb must agree with the subject, not a nearby noun.
- ~~The list of items **are** long.~~ → The list of items **is** long. (subject = list)
- ~~The students in the class **has** finished.~~ → The students in the class **have** finished. (subject = students)

## Error 2: There is / There are
The verb agrees with the noun AFTER it.
- There **is** a book on the table. (one book)
- There **are** books on the table. (multiple books)

## Error 3: Everyone / Nobody / Each (always singular)
- Everyone **is** (not are) welcome.
- Nobody **knows** (not know) the answer.
- Each student **has** (not have) a textbook.

## Error 4: Uncountable Nouns (always singular)
- The news **is** (not are) shocking.
- The furniture **is** (not are) expensive.
- Mathematics **is** (not are) difficult.

## Error 5: Collective Nouns
- The team **is** winning. (acting as one unit)
- The team **are** arguing among themselves. (acting as individuals — British English)

## Error 6: Either...or / Neither...nor
The verb agrees with the nearest subject.
- Neither he **nor** his friends **are** coming.
- Neither his friends **nor** he **is** coming.`, examples: JSON.stringify(["The box of chocolates **is** on the table. (subject = box)", "There **are** many students in the class. (students = plural)", "Everyone **has** to submit by Friday. (everyone = singular)", "The news **is** very concerning. (uncountable = singular)", "Neither the teacher **nor** the students **were** happy.", "Each of the rooms **has** a window. (each = singular)"]), tips: "The most common trick in exams: a phrase between the subject and verb. Always find the TRUE subject and ignore everything between it and the verb. 'The flowers IN THE VASE need water.' Subject = flowers (plural), not vase." } });
  for (const ex of [
    { topicId: t16_5.id, type: "multiple_choice", difficulty: "intermediate", question: "The box of chocolates ___ on the counter.", options: JSON.stringify(["are", "is", "were", "have"]), correctAnswer: "is", explanation: "Subject = 'box' (singular), not 'chocolates'. Singular subject → singular verb.", order: 1 },
    { topicId: t16_5.id, type: "multiple_choice", difficulty: "intermediate", question: "There ___ several reasons for this decision.", options: JSON.stringify(["is", "are", "was", "has"]), correctAnswer: "are", explanation: "'Reasons' (plural) follows 'there'. Use 'are' with plural nouns.", order: 2 },
    { topicId: t16_5.id, type: "multiple_choice", difficulty: "intermediate", question: "Everyone ___ to the meeting on time.", options: JSON.stringify(["come", "comes", "are coming", "have come"]), correctAnswer: "comes", explanation: "'Everyone' is always treated as singular: everyone comes, everyone has.", order: 3 },
    { topicId: t16_5.id, type: "fill_in_blank", difficulty: "intermediate", question: "The furniture in the rooms ___ expensive.", correctAnswer: "is|was", explanation: "'Furniture' is uncountable and always takes a singular verb.", order: 4 },
    { topicId: t16_5.id, type: "fill_in_blank", difficulty: "intermediate", question: "Neither the students nor the teacher ___ ready.", correctAnswer: "was|is", explanation: "With 'neither...nor', the verb agrees with the nearest subject: 'teacher' (singular) → 'was/is'.", order: 5 },
    { topicId: t16_5.id, type: "error_correction", difficulty: "intermediate", question: "The news are shocking.", correctAnswer: "The news is shocking.", explanation: "'News' is uncountable and always singular despite ending in -s.", order: 6 },
    { topicId: t16_5.id, type: "error_correction", difficulty: "intermediate", question: "Each of the students have their own computer.", correctAnswer: "Each of the students has their own computer.", explanation: "'Each' is always singular: 'Each has', not 'Each have'.", order: 7 },
    { topicId: t16_5.id, type: "sentence_rewrite", difficulty: "intermediate", question: "Fix agreement: 'The flowers in the vase needs water.'", correctAnswer: "The flowers in the vase need water.", explanation: "Subject = 'flowers' (plural), not 'vase'. Plural subject → plural verb: 'need'.", order: 8 },
  ]) { await db.grammarExercise.create({ data: ex }); }

  console.log("  Category 16: Common Errors - 5 topics seeded");

  // ============================================================
  // Final Summary
  // ============================================================
  console.log("");
  console.log("Grammar seed complete!");
  console.log("  16 categories");
  console.log("  85 topics");
  console.log("  85 lessons");
  console.log("  680 exercises");
}

seedGrammar()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
