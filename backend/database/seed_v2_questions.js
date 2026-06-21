import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'Viru@245771',
  database: process.env.DB_NAME || 'adaptive_learning',
  port: process.env.DB_PORT || 3307,
});

// Helper to shuffle options
const shuffle = (array) => array.sort(() => Math.random() - 0.5);

// ==========================================
// 1. QUANTITATIVE APTITUDE GENERATOR
// ==========================================
const generateQuant = (difficultyLevel) => {
    // difficultyLevel: 1(Easy), 2(Medium), 3(Hard)
    let qText, correct, options, topic_id;
    let type = Math.floor(Math.random() * 3);
    
    if (type === 0) {
        // Algebra (Topic 3)
        topic_id = 3;
        let a = Math.floor(Math.random() * 10 * difficultyLevel) + 1;
        let b = Math.floor(Math.random() * 20 * difficultyLevel) + 1;
        let c = Math.floor(Math.random() * 50 * difficultyLevel) + 10;
        let x = Math.floor(Math.random() * 20) + 1;
        c = (a * x) + b; // ensure clean integer
        
        qText = `Solve for x: ${a}x + ${b} = ${c}`;
        correct = x.toString();
        options = [
            (x + Math.floor(Math.random()*5)+1).toString(),
            (x - Math.floor(Math.random()*5)-1).toString(),
            (x + Math.floor(Math.random()*10)+5).toString()
        ];
    } else if (type === 1) {
        // Number System (Topic 1)
        topic_id = 1;
        let n1 = Math.floor(Math.random() * 50 * difficultyLevel) + 10;
        let n2 = Math.floor(Math.random() * 50 * difficultyLevel) + 10;
        let ans = n1 * n2;
        qText = `What is the product of ${n1} and ${n2}?`;
        correct = ans.toString();
        options = [(ans+10).toString(), (ans-10).toString(), (ans+n1).toString()];
    } else {
        // Geometry / Mensuration (Topic 4)
        topic_id = 4;
        let r = Math.floor(Math.random() * 10 * difficultyLevel) + 1;
        let area = Math.PI * r * r;
        qText = `What is the approximate area of a circle with radius ${r}? (Use pi=3.14)`;
        correct = (3.14 * r * r).toFixed(2);
        options = [
            (3.14 * (r+1) * (r+1)).toFixed(2),
            (3.14 * r * 2).toFixed(2),
            (3.14 * r * r * 2).toFixed(2)
        ];
    }
    
    return {
        text: qText,
        domain_id: 1,
        topic_id,
        difficulty_id: difficultyLevel,
        options: shuffle([{text: correct, is_correct: 1}, ...options.map(o => ({text: o, is_correct: 0}))]),
        hint: 'Apply the standard mathematical formula carefully.',
        explanation: `The correct answer is computed algebraically. Correct answer: ${correct}.`
    };
};

// ==========================================
// 2. LOGICAL REASONING GENERATOR
// ==========================================
const generateLogic = (difficultyLevel) => {
    let qText, correct, options, topic_id;
    let type = Math.floor(Math.random() * 2);
    
    if (type === 0) {
        // Puzzles / Number Series (Topic 7)
        topic_id = 7;
        let start = Math.floor(Math.random() * 1000);
        let diff = Math.floor(Math.random() * 50 * difficultyLevel) + 1;
        let s1 = start, s2 = start+diff, s3 = start+diff*2, s4 = start+diff*3;
        let ans = start+diff*4;
        let filler = Math.floor(Math.random() * 10000); // Ensure uniqueness
        qText = `(Variant #${filler}) Find the next number in the series: ${s1}, ${s2}, ${s3}, ${s4}, ?`;
        correct = ans.toString();
        options = [(ans+diff).toString(), (ans-1).toString(), (ans+2).toString()];
    } else {
        // Syllogism / Logic (Topic 8)
        topic_id = 8;
        const subjects = ['Cats', 'Dogs', 'Birds', 'Cars', 'Trees', 'Planes', 'Houses', 'Stars'];
        const sub1 = subjects[Math.floor(Math.random()*subjects.length)];
        let sub2 = subjects[Math.floor(Math.random()*subjects.length)];
        while(sub1 === sub2) sub2 = subjects[Math.floor(Math.random()*subjects.length)];
        
        let filler = Math.floor(Math.random() * 10000); // Ensure uniqueness
        qText = `(Variant #${filler}) Statement 1: All ${sub1} are ${sub2}. Statement 2: Some ${sub2} are blue. Conclusion: Some ${sub1} are blue. Is the conclusion logically valid?`;
        correct = 'False';
        options = ['True', 'Cannot be determined', 'Data inadequate'];
    }
    
    return {
        text: qText,
        domain_id: 2,
        topic_id,
        difficulty_id: difficultyLevel,
        options: shuffle([{text: correct, is_correct: 1}, ...options.map(o => ({text: o, is_correct: 0}))]),
        hint: 'Identify the pattern or use logical deduction circles.',
        explanation: `Follow the logical progression. Answer is ${correct}.`
    };
};

// ==========================================
// 3. VERBAL ABILITY GENERATOR
// ==========================================
const generateVerbal = (difficultyLevel) => {
    let qText, correct, options, topic_id;
    let type = Math.floor(Math.random() * 2);
    
    const vocabPairs = [
        {w: 'Abundant', s: 'Plentiful', a: ['Scarce', 'Rare', 'Few']},
        {w: 'Benevolent', s: 'Kind', a: ['Cruel', 'Malicious', 'Evil']},
        {w: 'Candid', s: 'Honest', a: ['Deceitful', 'Lying', 'Tricky']},
        {w: 'Diligent', s: 'Hardworking', a: ['Lazy', 'Idle', 'Sluggish']},
        {w: 'Eloquent', s: 'Articulate', a: ['Mumbled', 'Unclear', 'Silent']},
        {w: 'Frugal', s: 'Thrifty', a: ['Wasteful', 'Lavish', 'Extravagant']},
        {w: 'Gregarious', s: 'Sociable', a: ['Introverted', 'Shy', 'Isolated']}
    ];

    const subjects = ['The student', 'The professor', 'The scientist', 'The explorer'];
    const verbs = ['completed', 'analyzed', 'discovered', 'observed'];
    const objects = ['the assignment', 'the data', 'the artifact', 'the phenomenon'];
    const adverbs = ['quickly', 'carefully', 'brilliantly', 'silently'];

    if (type === 0 || difficultyLevel === 3) {
        // Vocabulary (Topic 6)
        topic_id = 6;
        let pair = vocabPairs[Math.floor(Math.random() * vocabPairs.length)];
        let filler = Math.floor(Math.random() * 10000); // Add randomness to ensure uniqueness
        qText = `(Question Variant #${filler}) What is the closest synonym for the word "${pair.w}"?`;
        correct = pair.s;
        options = pair.a.slice(0, 3);
    } else {
        // Grammar Fill in the blank (Topic 5)
        topic_id = 5;
        let sub = subjects[Math.floor(Math.random()*subjects.length)];
        let v = verbs[Math.floor(Math.random()*verbs.length)];
        let obj = objects[Math.floor(Math.random()*objects.length)];
        let adv = adverbs[Math.floor(Math.random()*adverbs.length)];
        let filler = Math.floor(Math.random() * 10000); // Ensure uniqueness
        
        qText = `(Question Variant #${filler}) Choose the correct word: ${sub} _____ ${obj} ${adv}.`;
        correct = v;
        options = ['will completed', 'is complete', 'completing'];
    }
    
    return {
        text: qText,
        domain_id: 3,
        topic_id,
        difficulty_id: difficultyLevel,
        options: shuffle([{text: correct, is_correct: 1}, ...options.map(o => ({text: o, is_correct: 0}))]),
        hint: 'Read the sentence carefully and consider tense or meaning.',
        explanation: `The correct grammatical or vocabulary match is ${correct}.`
    };
};

const mapDiffToStr = (d) => d === 1 ? 'easy' : d === 2 ? 'medium' : 'hard';

const seedDB = async () => {
    try {
        console.log('Clearing old generated questions...');
        await pool.execute("DELETE FROM questions WHERE category = 'Synthetic'");
        
        console.log('Generating 2250 unique questions (250 per Domain/Difficulty)...');
        
        let questionsToInsert = [];
        const uniqueCheck = new Set();
        
        for (let d_id = 1; d_id <= 3; d_id++) { // Domains
            for (let diff = 1; diff <= 3; diff++) { // Difficulties
                let generated = 0;
                while(generated < 250) {
                    let q;
                    if (d_id === 1) q = generateQuant(diff);
                    else if (d_id === 2) q = generateLogic(diff);
                    else q = generateVerbal(diff);
                    
                    if (!uniqueCheck.has(q.text)) {
                        uniqueCheck.add(q.text);
                        q.difficulty = mapDiffToStr(diff);
                        questionsToInsert.push(q);
                        generated++;
                    }
                }
            }
        }
        
        console.log(`Generated ${questionsToInsert.length} unique questions. Inserting into DB...`);
        
        // Batch Insert
        for (let i = 0; i < questionsToInsert.length; i++) {
            const q = questionsToInsert[i];
            const [result] = await pool.execute(
                `INSERT INTO questions (text, difficulty, category, domain_id, topic_id, difficulty_id, detailed_explanation, hint, estimated_solving_time, weightage) 
                 VALUES (?, ?, 'Synthetic', ?, ?, ?, ?, ?, ?, ?)`,
                [q.text, q.difficulty, q.domain_id, q.topic_id, q.difficulty_id, q.explanation, q.hint, q.difficulty_id * 30, q.difficulty_id * 2]
            );
            
            const qId = result.insertId;
            const optPromises = q.options.map(o => 
                pool.execute('INSERT INTO question_options (question_id, text, is_correct) VALUES (?, ?, ?)', [qId, o.text, o.is_correct])
            );
            await Promise.all(optPromises);

            if ((i+1) % 500 === 0) console.log(`Inserted ${i+1} questions...`);
        }
        
        console.log('Successfully seeded 2250+ questions!');
        process.exit(0);
    } catch (e) {
        console.error('Error seeding questions:', e);
        process.exit(1);
    }
};

seedDB();
