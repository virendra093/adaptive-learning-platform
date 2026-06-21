-- ========================================================
-- APTITUDE QUESTION BANK - PART 1
-- Domain: Quantitative Aptitude
-- Difficulty: Easy
-- Total Questions: 20
-- Compatible with MySQL 8.0.41
-- ========================================================

-- Ensure Domain 1 (Quantitative Aptitude) exists
INSERT IGNORE INTO domains (id, name, description) VALUES (1, 'Quantitative Aptitude', 'Mathematical and numerical ability');

-- Insert Missing Topics to satisfy Foreign Key Constraints in MySQL 8.0
INSERT IGNORE INTO topics (id, domain_id, name) VALUES 
(1, 1, 'Percentages'),
(2, 1, 'Ratio & Proportion'),
(3, 1, 'Profit & Loss'),
(4, 1, 'Simple Interest'),
(5, 1, 'Time & Work'),
(6, 1, 'Time, Speed & Distance'),
(7, 1, 'Number System'),
(8, 1, 'Averages'),
(9, 1, 'Ages'),
(10, 1, 'LCM & HCF');

-- Insert Missing Subtopics
INSERT IGNORE INTO subtopics (id, topic_id, name) VALUES 
(1, 1, 'Basic Percentages'),
(2, 1, 'Percentage Applications'),
(3, 2, 'Basic Ratios'),
(4, 2, 'Combined Ratios'),
(5, 3, 'Basic Profit/Loss'),
(6, 3, 'Selling Price Calculation'),
(7, 4, 'Basic Simple Interest'),
(8, 4, 'Rate Calculation'),
(9, 5, 'Combined Work'),
(10, 5, 'Man-Days Concept'),
(11, 6, 'Unit Conversions'),
(12, 6, 'Average Speed'),
(13, 7, 'Sum of Series'),
(14, 7, 'Prime Numbers'),
(15, 8, 'Basic Averages'),
(16, 8, 'Average of Sequences'),
(17, 9, 'Ratio-based Age Problems'),
(18, 9, 'Equation-based Age Problems'),
(19, 10, 'LCM Calculation'),
(20, 10, 'HCF Calculation');


-- Q1: Percentages (Topic: 1, Subtopic: 1)
INSERT INTO questions (text, difficulty, category, domain_id, topic_id, subtopic_id, difficulty_id, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) 
VALUES (
    'What is 25% of 160?', 
    'easy', 'Quantitative Aptitude', 1, 1, 1, 1, 
    '25% is equivalent to the fraction 1/4. Therefore, 1/4 of 160 is 40. Alternatively, 10% is 16, 20% is 32, and 5% is 8, so 32 + 8 = 40.', 
    30, 1, 'percentages,basic-math', 'Convert 25% to a fraction (1/4) to solve it quickly.', 'Understand and calculate basic percentage values rapidly.'
);
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '30', FALSE), (@last_id, '40', TRUE), (@last_id, '45', FALSE), (@last_id, '50', FALSE);

-- Q2: Percentages (Topic: 1, Subtopic: 2)
INSERT INTO questions (text, difficulty, category, domain_id, topic_id, subtopic_id, difficulty_id, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) 
VALUES (
    'If 40% of a number is 120, what is the number?', 
    'easy', 'Quantitative Aptitude', 1, 1, 2, 1, 
    'Let the number be x. Given 0.40 * x = 120. Solving for x gives x = 120 / 0.40 = 300.', 
    40, 1, 'percentages,algebra', 'Set up an equation: 0.4 * x = 120.', 'Apply percentage concepts to find an unknown base value.'
);
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '240', FALSE), (@last_id, '280', FALSE), (@last_id, '300', TRUE), (@last_id, '400', FALSE);

-- Q3: Ratio & Proportion (Topic: 2, Subtopic: 3)
INSERT INTO questions (text, difficulty, category, domain_id, topic_id, subtopic_id, difficulty_id, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) 
VALUES (
    'Divide 150 in the ratio 2:3. What is the larger part?', 
    'easy', 'Quantitative Aptitude', 1, 2, 3, 1, 
    'The total parts are 2 + 3 = 5. One part is 150 / 5 = 30. The larger part is 3 * 30 = 90.', 
    30, 1, 'ratio,division', 'Find the value of one part by dividing the total by the sum of ratio parts.', 'Divide a given quantity into a specific ratio.'
);
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '60', FALSE), (@last_id, '75', FALSE), (@last_id, '80', FALSE), (@last_id, '90', TRUE);

-- Q4: Ratio & Proportion (Topic: 2, Subtopic: 4)
INSERT INTO questions (text, difficulty, category, domain_id, topic_id, subtopic_id, difficulty_id, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) 
VALUES (
    'If A:B = 3:4 and B:C = 4:5, what is A:C?', 
    'easy', 'Quantitative Aptitude', 1, 2, 4, 1, 
    'Since the value of B is the same in both ratios (4), you can directly combine them: A:B:C = 3:4:5. Therefore, A:C = 3:5.', 
    25, 1, 'ratio,transitivity', 'Check if the common term has the same value in both ratios.', 'Combine two separate ratios into a single continuous ratio.'
);
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '3:4', FALSE), (@last_id, '3:5', TRUE), (@last_id, '4:5', FALSE), (@last_id, '12:20', FALSE);

-- Q5: Profit & Loss (Topic: 3, Subtopic: 5)
INSERT INTO questions (text, difficulty, category, domain_id, topic_id, subtopic_id, difficulty_id, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) 
VALUES (
    'An article is bought for $200 and sold for $250. Find the profit percentage.', 
    'easy', 'Quantitative Aptitude', 1, 3, 5, 1, 
    'Profit = Selling Price (SP) - Cost Price (CP) = 250 - 200 = 50. Profit Percentage = (Profit / CP) * 100 = (50 / 200) * 100 = 25%.', 
    30, 1, 'profit-loss,percentages', 'Profit percentage is always calculated on the Cost Price (CP).', 'Calculate profit percentage given cost and selling prices.'
);
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '20%', FALSE), (@last_id, '25%', TRUE), (@last_id, '50%', FALSE), (@last_id, '12.5%', FALSE);

-- Q6: Profit & Loss (Topic: 3, Subtopic: 6)
INSERT INTO questions (text, difficulty, category, domain_id, topic_id, subtopic_id, difficulty_id, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) 
VALUES (
    'By selling a watch for $144, a man loses 10%. What is the cost price?', 
    'easy', 'Quantitative Aptitude', 1, 3, 6, 1, 
    'Let the Cost Price (CP) be x. Loss = 10%, so Selling Price (SP) = 90% of CP. 0.9x = 144. x = 144 / 0.9 = 160.', 
    45, 1, 'profit-loss,equations', 'The selling price represents 90% of the original cost.', 'Find the cost price given the selling price and loss percentage.'
);
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '$150', FALSE), (@last_id, '$154', FALSE), (@last_id, '$160', TRUE), (@last_id, '$172', FALSE);

-- Q7: Simple Interest (Topic: 4, Subtopic: 7)
INSERT INTO questions (text, difficulty, category, domain_id, topic_id, subtopic_id, difficulty_id, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) 
VALUES (
    'Find the Simple Interest on $1000 at 5% per annum for 2 years.', 
    'easy', 'Quantitative Aptitude', 1, 4, 7, 1, 
    'Simple Interest (SI) formula: SI = (P * R * T) / 100. SI = (1000 * 5 * 2) / 100 = 100.', 
    20, 1, 'simple-interest,finance', 'Use the formula PRT/100.', 'Calculate standard simple interest over a given time period.'
);
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '$50', FALSE), (@last_id, '$100', TRUE), (@last_id, '$150', FALSE), (@last_id, '$200', FALSE);

-- Q8: Simple Interest (Topic: 4, Subtopic: 8)
INSERT INTO questions (text, difficulty, category, domain_id, topic_id, subtopic_id, difficulty_id, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) 
VALUES (
    'At what rate of Simple Interest will a principal sum double itself in 10 years?', 
    'easy', 'Quantitative Aptitude', 1, 4, 8, 1, 
    'If the sum doubles, the Interest equals the Principal (I = P). Using I = (P*R*T)/100 => P = (P*R*10)/100 => 1 = R/10 => R = 10%.', 
    40, 1, 'simple-interest,rates', 'If a sum doubles, the interest earned is exactly equal to the principal.', 'Determine the rate of interest for a principal to multiply.'
);
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '5%', FALSE), (@last_id, '10%', TRUE), (@last_id, '15%', FALSE), (@last_id, '20%', FALSE);

-- Q9: Time & Work (Topic: 5, Subtopic: 9)
INSERT INTO questions (text, difficulty, category, domain_id, topic_id, subtopic_id, difficulty_id, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) 
VALUES (
    'A can do a piece of work in 10 days and B can do it in 15 days. In how many days can they complete it together?', 
    'easy', 'Quantitative Aptitude', 1, 5, 9, 1, 
    'A\'s 1-day work = 1/10. B\'s 1-day work = 1/15. Together 1-day work = 1/10 + 1/15 = 3/30 + 2/30 = 5/30 = 1/6. Total time = 6 days.', 
    45, 1, 'time-work,fractions', 'Calculate their 1-day work capacities and add them.', 'Solve basic cooperative work problems.'
);
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '5 days', FALSE), (@last_id, '6 days', TRUE), (@last_id, '8 days', FALSE), (@last_id, '12.5 days', FALSE);

-- Q10: Time & Work (Topic: 5, Subtopic: 10)
INSERT INTO questions (text, difficulty, category, domain_id, topic_id, subtopic_id, difficulty_id, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) 
VALUES (
    'If 5 men can complete a project in 12 days, how many days will 6 men take to complete the same project?', 
    'easy', 'Quantitative Aptitude', 1, 5, 10, 1, 
    'Total man-days required = 5 men * 12 days = 60 man-days. For 6 men: 60 / 6 = 10 days.', 
    30, 1, 'time-work,inversely-proportional', 'More men mean fewer days. Use M1 * D1 = M2 * D2.', 'Apply the concept of man-days to find time required for different group sizes.'
);
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '8 days', FALSE), (@last_id, '9 days', FALSE), (@last_id, '10 days', TRUE), (@last_id, '14.4 days', FALSE);

-- Q11: Time, Speed & Distance (Topic: 6, Subtopic: 11)
INSERT INTO questions (text, difficulty, category, domain_id, topic_id, subtopic_id, difficulty_id, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) 
VALUES (
    'A train is traveling at a speed of 72 km/hr. What is its speed in m/s?', 
    'easy', 'Quantitative Aptitude', 1, 6, 11, 1, 
    'To convert km/hr to m/s, multiply by 5/18. 72 * (5/18) = 4 * 5 = 20 m/s.', 
    20, 1, 'speed-distance,conversions', 'Multiply km/hr by 5/18 to get m/s.', 'Convert speed units correctly.'
);
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '15 m/s', FALSE), (@last_id, '20 m/s', TRUE), (@last_id, '25 m/s', FALSE), (@last_id, '30 m/s', FALSE);

-- Q12: Time, Speed & Distance (Topic: 6, Subtopic: 12)
INSERT INTO questions (text, difficulty, category, domain_id, topic_id, subtopic_id, difficulty_id, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) 
VALUES (
    'A car covers a distance of 300 km in 5 hours. What is its average speed?', 
    'easy', 'Quantitative Aptitude', 1, 6, 12, 1, 
    'Speed = Distance / Time = 300 km / 5 hours = 60 km/hr.', 
    15, 1, 'speed-distance,averages', 'Use the basic formula: Speed = Distance/Time.', 'Calculate basic average speed.'
);
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '50 km/hr', FALSE), (@last_id, '55 km/hr', FALSE), (@last_id, '60 km/hr', TRUE), (@last_id, '65 km/hr', FALSE);

-- Q13: Number System (Topic: 7, Subtopic: 13)
INSERT INTO questions (text, difficulty, category, domain_id, topic_id, subtopic_id, difficulty_id, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) 
VALUES (
    'What is the sum of the first 10 natural numbers?', 
    'easy', 'Quantitative Aptitude', 1, 7, 13, 1, 
    'The sum of the first n natural numbers is given by n(n+1)/2. For n=10, Sum = 10(11)/2 = 55.', 
    20, 1, 'number-system,series', 'Use the formula n(n+1)/2.', 'Understand and apply the formula for the sum of natural numbers.'
);
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '45', FALSE), (@last_id, '50', FALSE), (@last_id, '55', TRUE), (@last_id, '60', FALSE);

-- Q14: Number System (Topic: 7, Subtopic: 14)
INSERT INTO questions (text, difficulty, category, domain_id, topic_id, subtopic_id, difficulty_id, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) 
VALUES (
    'Which of the following numbers is a prime number?', 
    'easy', 'Quantitative Aptitude', 1, 7, 14, 1, 
    '39 is divisible by 3. 51 is divisible by 3. 57 is divisible by 3. 59 has no divisors other than 1 and itself, making it a prime number.', 
    30, 1, 'number-system,primes', 'Check divisibility by small primes like 2, 3, 5, and 7.', 'Identify prime numbers based on their divisibility properties.'
);
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '39', FALSE), (@last_id, '51', FALSE), (@last_id, '57', FALSE), (@last_id, '59', TRUE);

-- Q15: Averages (Topic: 8, Subtopic: 15)
INSERT INTO questions (text, difficulty, category, domain_id, topic_id, subtopic_id, difficulty_id, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) 
VALUES (
    'The average of 4 numbers is 20. If three of the numbers are 15, 25, and 10, what is the fourth number?', 
    'easy', 'Quantitative Aptitude', 1, 8, 15, 1, 
    'Total sum of 4 numbers = Average * 4 = 20 * 4 = 80. Sum of three numbers = 15 + 25 + 10 = 50. Fourth number = 80 - 50 = 30.', 
    35, 1, 'averages,algebra', 'Find the total sum first, then subtract the known numbers.', 'Determine missing data points using average formulas.'
);
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '25', FALSE), (@last_id, '30', TRUE), (@last_id, '35', FALSE), (@last_id, '40', FALSE);

-- Q16: Averages (Topic: 8, Subtopic: 16)
INSERT INTO questions (text, difficulty, category, domain_id, topic_id, subtopic_id, difficulty_id, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) 
VALUES (
    'Find the average of the first 5 multiples of 3.', 
    'easy', 'Quantitative Aptitude', 1, 8, 16, 1, 
    'The first 5 multiples of 3 are 3, 6, 9, 12, 15. This is an arithmetic progression, so the average is the middle term, which is 9.', 
    25, 1, 'averages,sequences', 'For an arithmetic progression, the average is the median (middle term).', 'Calculate the average of numbers in a sequence rapidly.'
);
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '6', FALSE), (@last_id, '9', TRUE), (@last_id, '12', FALSE), (@last_id, '15', FALSE);

-- Q17: Ages (Topic: 9, Subtopic: 17)
INSERT INTO questions (text, difficulty, category, domain_id, topic_id, subtopic_id, difficulty_id, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) 
VALUES (
    'The ratio of the present ages of A and B is 3:4. After 5 years, the ratio will be 4:5. What is A\'s present age?', 
    'easy', 'Quantitative Aptitude', 1, 9, 17, 1, 
    'Let present ages be 3x and 4x. (3x + 5) / (4x + 5) = 4 / 5. Cross multiplying: 15x + 25 = 16x + 20 => x = 5. A\'s present age = 3x = 15.', 
    50, 1, 'ages,algebra,ratio', 'Set up an equation representing the future ages to solve for x.', 'Solve age-related word problems using linear equations.'
);
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '10 years', FALSE), (@last_id, '15 years', TRUE), (@last_id, '20 years', FALSE), (@last_id, '25 years', FALSE);

-- Q18: Ages (Topic: 9, Subtopic: 18)
INSERT INTO questions (text, difficulty, category, domain_id, topic_id, subtopic_id, difficulty_id, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) 
VALUES (
    'A father is 3 times as old as his son. If the sum of their ages is 40 years, what is the son\'s age?', 
    'easy', 'Quantitative Aptitude', 1, 9, 18, 1, 
    'Let son\'s age be x. Father\'s age = 3x. Sum = x + 3x = 4x. 4x = 40 => x = 10. The son is 10 years old.', 
    30, 1, 'ages,equations', 'Define one age as a variable and express the other in terms of it.', 'Formulate and solve equations based on age relations.'
);
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '10 years', TRUE), (@last_id, '12 years', FALSE), (@last_id, '15 years', FALSE), (@last_id, '30 years', FALSE);

-- Q19: LCM & HCF (Topic: 10, Subtopic: 19)
INSERT INTO questions (text, difficulty, category, domain_id, topic_id, subtopic_id, difficulty_id, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) 
VALUES (
    'Find the Least Common Multiple (LCM) of 12 and 15.', 
    'easy', 'Quantitative Aptitude', 1, 10, 19, 1, 
    'Prime factorization: 12 = 2^2 * 3, 15 = 3 * 5. LCM takes the highest power of all prime factors: 2^2 * 3 * 5 = 4 * 3 * 5 = 60.', 
    25, 1, 'lcm-hcf,number-system', 'List the multiples of the larger number until you find one divisible by the smaller number.', 'Calculate LCM using prime factorization or multiples.'
);
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '30', FALSE), (@last_id, '45', FALSE), (@last_id, '60', TRUE), (@last_id, '180', FALSE);

-- Q20: LCM & HCF (Topic: 10, Subtopic: 20)
INSERT INTO questions (text, difficulty, category, domain_id, topic_id, subtopic_id, difficulty_id, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) 
VALUES (
    'Find the Highest Common Factor (HCF) of 24 and 36.', 
    'easy', 'Quantitative Aptitude', 1, 10, 20, 1, 
    'Factors of 24: 1, 2, 3, 4, 6, 8, 12, 24. Factors of 36: 1, 2, 3, 4, 6, 9, 12, 18, 36. The highest common factor is 12.', 
    25, 1, 'lcm-hcf,number-system', 'Find the largest number that divides both values without a remainder.', 'Determine HCF using factor lists or division methods.'
);
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '6', FALSE), (@last_id, '8', FALSE), (@last_id, '12', TRUE), (@last_id, '24', FALSE);
