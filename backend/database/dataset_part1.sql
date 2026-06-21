-- Schema update to support the new fields required for the aptitude question bank
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS domain VARCHAR(255) AFTER category,
ADD COLUMN IF NOT EXISTS topic VARCHAR(255),
ADD COLUMN IF NOT EXISTS subtopic VARCHAR(255),
ADD COLUMN IF NOT EXISTS detailed_explanation TEXT,
ADD COLUMN IF NOT EXISTS estimated_solving_time INT COMMENT 'in seconds',
ADD COLUMN IF NOT EXISTS weightage INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS tags VARCHAR(255),
ADD COLUMN IF NOT EXISTS hint TEXT,
ADD COLUMN IF NOT EXISTS learning_objective TEXT;

-- Part 1: 20 Questions
-- Domain: Quantitative Aptitude
-- Difficulty: Easy
-- Questions: 1 to 20

-- Question 1
INSERT INTO questions (text, difficulty, category, domain, topic, subtopic, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) VALUES 
('What is the sum of the first 10 even natural numbers?', 'easy', 'Math', 'Quantitative Aptitude', 'Number System', 'Arithmetic Progression', 'The sum of the first n even natural numbers is given by the formula n(n+1). For n=10, the sum is 10 * 11 = 110.', 30, 1, 'number-system, series', 'Use the formula n(n+1).', 'Understand the properties of even number series.');
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '100', 0), (@last_id, '110', 1), (@last_id, '120', 0), (@last_id, '130', 0);

-- Question 2
INSERT INTO questions (text, difficulty, category, domain, topic, subtopic, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) VALUES 
('What is 15% of 60?', 'easy', 'Math', 'Quantitative Aptitude', 'Percentages', 'Basic Percentage Calculation', '15% of 60 = (15 / 100) * 60 = 9.', 20, 1, 'percentages, arithmetic', 'Multiply 60 by 0.15.', 'Master basic percentage calculations.');
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '8', 0), (@last_id, '9', 1), (@last_id, '10', 0), (@last_id, '12', 0);

-- Question 3
INSERT INTO questions (text, difficulty, category, domain, topic, subtopic, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) VALUES 
('If the ratio of boys to girls in a class is 3:2 and there are 15 boys, how many girls are there?', 'easy', 'Math', 'Quantitative Aptitude', 'Ratio and Proportion', 'Basic Ratio', 'Let the number of boys and girls be 3x and 2x respectively. Given 3x = 15, so x = 5. The number of girls is 2x = 2 * 5 = 10.', 45, 1, 'ratio, algebra', 'Find the value of 1 ratio unit by dividing the number of boys by 3.', 'Apply ratio concepts to solve quantity problems.');
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '8', 0), (@last_id, '10', 1), (@last_id, '12', 0), (@last_id, '15', 0);

-- Question 4
INSERT INTO questions (text, difficulty, category, domain, topic, subtopic, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) VALUES 
('What is the average of the first 5 prime numbers?', 'easy', 'Math', 'Quantitative Aptitude', 'Average', 'Averages of Sequences', 'The first 5 prime numbers are 2, 3, 5, 7, and 11. Their sum is 28. Average = 28 / 5 = 5.6.', 40, 1, 'average, prime-numbers', 'Remember that 1 is not a prime number. Start with 2.', 'Calculate the mean of a specific mathematical set.');
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '5.4', 0), (@last_id, '5.6', 1), (@last_id, '5.8', 0), (@last_id, '6.0', 0);

-- Question 5
INSERT INTO questions (text, difficulty, category, domain, topic, subtopic, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) VALUES 
('If A can do a piece of work in 10 days and B can do it in 15 days, how long will they take working together?', 'easy', 'Math', 'Quantitative Aptitude', 'Time and Work', 'Two-Person Work', 'A''s 1 day work = 1/10. B''s 1 day work = 1/15. (A+B)''s 1 day work = 1/10 + 1/15 = 5/30 = 1/6. They will finish the work in 6 days.', 60, 1, 'time-and-work, fractions', 'Add their one-day work capacities together.', 'Compute combined efficiency and time required.');
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '5 days', 0), (@last_id, '6 days', 1), (@last_id, '8 days', 0), (@last_id, '12 days', 0);

-- Question 6
INSERT INTO questions (text, difficulty, category, domain, topic, subtopic, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) VALUES 
('A car travels 150 km in 3 hours. What is its speed?', 'easy', 'Math', 'Quantitative Aptitude', 'Time Speed and Distance', 'Basic Speed Calculation', 'Speed = Distance / Time = 150 km / 3 hours = 50 km/hr.', 20, 1, 'speed-distance, kinematics', 'Divide the total distance by the total time.', 'Apply the fundamental speed, distance, and time formula.');
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '40 km/hr', 0), (@last_id, '45 km/hr', 0), (@last_id, '50 km/hr', 1), (@last_id, '60 km/hr', 0);

-- Question 7
INSERT INTO questions (text, difficulty, category, domain, topic, subtopic, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) VALUES 
('What is the simple interest on $1000 at 5% per annum for 2 years?', 'easy', 'Math', 'Quantitative Aptitude', 'Simple Interest', 'Interest Calculation', 'Simple Interest = (Principal * Rate * Time) / 100 = (1000 * 5 * 2) / 100 = $100.', 30, 1, 'simple-interest, financial-math', 'Use the formula SI = P*R*T/100.', 'Calculate simple interest over a given time period.');
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '$50', 0), (@last_id, '$100', 1), (@last_id, '$150', 0), (@last_id, '$200', 0);

-- Question 8
INSERT INTO questions (text, difficulty, category, domain, topic, subtopic, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) VALUES 
('An article is bought for $50 and sold for $60. What is the profit percentage?', 'easy', 'Math', 'Quantitative Aptitude', 'Profit and Loss', 'Profit Percentage', 'Profit = Selling Price - Cost Price = 60 - 50 = 10. Profit Percentage = (Profit / Cost Price) * 100 = (10 / 50) * 100 = 20%.', 30, 1, 'profit-loss, percentages', 'Find the absolute profit first, then express it as a percentage of the cost price.', 'Determine the profit margin as a percentage of cost.');
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '10%', 0), (@last_id, '15%', 0), (@last_id, '20%', 1), (@last_id, '25%', 0);

-- Question 9
INSERT INTO questions (text, difficulty, category, domain, topic, subtopic, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) VALUES 
('Solve for x: 3x - 5 = 16.', 'easy', 'Math', 'Quantitative Aptitude', 'Algebra', 'Linear Equations', '3x - 5 = 16 => 3x = 16 + 5 => 3x = 21 => x = 7.', 25, 1, 'algebra, linear-equations', 'Isolate the variable x on one side of the equation.', 'Solve basic linear equations with one variable.');
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '6', 0), (@last_id, '7', 1), (@last_id, '8', 0), (@last_id, '9', 0);

-- Question 10
INSERT INTO questions (text, difficulty, category, domain, topic, subtopic, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) VALUES 
('What is the area of a rectangle with length 10cm and width 5cm?', 'easy', 'Math', 'Quantitative Aptitude', 'Geometry', '2D Area', 'Area of a rectangle = length * width = 10cm * 5cm = 50 sq cm.', 15, 1, 'geometry, mensuration', 'Multiply the length by the width.', 'Calculate the area of basic two-dimensional shapes.');
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '30 sq cm', 0), (@last_id, '40 sq cm', 0), (@last_id, '50 sq cm', 1), (@last_id, '60 sq cm', 0);

-- Question 11
INSERT INTO questions (text, difficulty, category, domain, topic, subtopic, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) VALUES 
('If a fair coin is tossed twice, what is the probability of getting at least one head?', 'easy', 'Math', 'Quantitative Aptitude', 'Probability', 'Coin Toss', 'Possible outcomes: HH, HT, TH, TT. Outcomes with at least one head: HH, HT, TH. Probability = 3/4 = 0.75.', 40, 1, 'probability, basic-events', 'List the sample space or subtract the probability of getting no heads from 1.', 'Calculate probabilities for independent sequential events.');
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '1/4', 0), (@last_id, '1/2', 0), (@last_id, '3/4', 1), (@last_id, '1', 0);

-- Question 12
INSERT INTO questions (text, difficulty, category, domain, topic, subtopic, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) VALUES 
('How many ways can 3 people be arranged in a line?', 'easy', 'Math', 'Quantitative Aptitude', 'Permutation and Combination', 'Linear Arrangement', 'The number of ways to arrange n distinct objects in a line is n factorial (n!). For 3 people, it is 3! = 3 * 2 * 1 = 6 ways.', 20, 1, 'permutations, factorials', 'Use the factorial function (n!).', 'Understand and apply basic permutation logic.');
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '3', 0), (@last_id, '6', 1), (@last_id, '9', 0), (@last_id, '12', 0);

-- Question 13
INSERT INTO questions (text, difficulty, category, domain, topic, subtopic, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) VALUES 
('What is the volume of a cube with a side length of 4cm?', 'easy', 'Math', 'Quantitative Aptitude', 'Mensuration', '3D Volume', 'Volume of a cube = side^3. Here, volume = 4^3 = 4 * 4 * 4 = 64 cubic cm.', 20, 1, 'volume, 3d-geometry', 'Cube the side length.', 'Determine the volume of regular three-dimensional solids.');
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '16 cubic cm', 0), (@last_id, '32 cubic cm', 0), (@last_id, '64 cubic cm', 1), (@last_id, '128 cubic cm', 0);

-- Question 14
INSERT INTO questions (text, difficulty, category, domain, topic, subtopic, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) VALUES 
('If a number is decreased by 20% and then increased by 20%, what is the net percentage change?', 'easy', 'Math', 'Quantitative Aptitude', 'Percentages', 'Successive Percentage Change', 'Let the number be 100. Decrease by 20% gives 80. Increase 80 by 20% gives 80 + 16 = 96. Net change = 100 - 96 = 4% decrease. Alternatively, use the formula -x^2/100 for equal successive change: -400/100 = -4%.', 50, 1, 'percentages, successive-change', 'Calculate the change sequentially, or use the net effect formula.', 'Evaluate successive percentage changes on a base value.');
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, 'No change', 0), (@last_id, '4% increase', 0), (@last_id, '4% decrease', 1), (@last_id, '8% decrease', 0);

-- Question 15
INSERT INTO questions (text, difficulty, category, domain, topic, subtopic, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) VALUES 
('If the cost price of 10 articles equals the selling price of 8 articles, find the gain percent.', 'easy', 'Math', 'Quantitative Aptitude', 'Profit and Loss', 'Quantity based Profit', 'Let the CP of 1 article be $1. Then CP of 8 articles = $8. SP of 8 articles = CP of 10 articles = $10. Gain = 10 - 8 = $2. Gain % = (2 / 8) * 100 = 25%.', 60, 1, 'profit-loss, quantity', 'Assume a unit price for the cost price to simplify calculations.', 'Solve profit and loss problems involving quantities of goods.');
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '20%', 0), (@last_id, '25%', 1), (@last_id, '30%', 0), (@last_id, '33.33%', 0);

-- Question 16
INSERT INTO questions (text, difficulty, category, domain, topic, subtopic, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) VALUES 
('Find the Lowest Common Multiple (LCM) of 12 and 18.', 'easy', 'Math', 'Quantitative Aptitude', 'Number System', 'LCM and HCF', 'Multiples of 12: 12, 24, 36, 48... Multiples of 18: 18, 36, 54... The lowest common multiple is 36.', 30, 1, 'lcm, arithmetic', 'Find the prime factorization of both numbers or list their multiples.', 'Calculate the LCM of two integers.');
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '24', 0), (@last_id, '36', 1), (@last_id, '54', 0), (@last_id, '72', 0);

-- Question 17
INSERT INTO questions (text, difficulty, category, domain, topic, subtopic, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) VALUES 
('A sum of money doubles itself in 5 years at simple interest. What is the rate of interest?', 'easy', 'Math', 'Quantitative Aptitude', 'Simple Interest', 'Rate Calculation', 'Let Principal be P. Amount = 2P. Simple Interest = 2P - P = P. Using SI = (P * R * T) / 100 => P = (P * R * 5) / 100 => 1 = (R * 5) / 100 => R = 100 / 5 = 20%.', 50, 1, 'simple-interest, algebra', 'If it doubles, the interest earned is equal to the principal.', 'Determine the interest rate given the principal multiplier and time.');
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '10%', 0), (@last_id, '15%', 0), (@last_id, '20%', 1), (@last_id, '25%', 0);

-- Question 18
INSERT INTO questions (text, difficulty, category, domain, topic, subtopic, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) VALUES 
('The average age of 5 children is 10 years. If one child aged 14 leaves the group, what is the new average age?', 'easy', 'Math', 'Quantitative Aptitude', 'Average', 'Group Change', 'Total age of 5 children = 5 * 10 = 50 years. After a 14-year-old leaves, new total age = 50 - 14 = 36 years. Number of remaining children = 4. New average = 36 / 4 = 9 years.', 45, 1, 'average, group-dynamics', 'Calculate the total sum before and after the change.', 'Compute the new average when a member leaves a group.');
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '8 years', 0), (@last_id, '9 years', 1), (@last_id, '9.5 years', 0), (@last_id, '10 years', 0);

-- Question 19
INSERT INTO questions (text, difficulty, category, domain, topic, subtopic, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) VALUES 
('Convert 72 km/hr into m/s.', 'easy', 'Math', 'Quantitative Aptitude', 'Time Speed and Distance', 'Unit Conversion', 'To convert km/hr to m/s, multiply by 5/18. 72 * (5 / 18) = 4 * 5 = 20 m/s.', 20, 1, 'speed-conversion, units', 'Multiply by the fraction 5/18.', 'Perform speed unit conversions efficiently.');
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '15 m/s', 0), (@last_id, '20 m/s', 1), (@last_id, '25 m/s', 0), (@last_id, '30 m/s', 0);

-- Question 20
INSERT INTO questions (text, difficulty, category, domain, topic, subtopic, detailed_explanation, estimated_solving_time, weightage, tags, hint, learning_objective) VALUES 
('A shopkeeper gives a discount of 10% on the marked price of an item. If the marked price is $200, what is the selling price?', 'easy', 'Math', 'Quantitative Aptitude', 'Profit and Loss', 'Discounts', 'Discount = 10% of $200 = (10 / 100) * 200 = $20. Selling Price = Marked Price - Discount = 200 - 20 = $180.', 30, 1, 'discount, commercial-math', 'Subtract the discount amount from the marked price.', 'Calculate the final selling price after applying a percentage discount.');
SET @last_id = LAST_INSERT_ID();
INSERT INTO question_options (question_id, text, is_correct) VALUES 
(@last_id, '$170', 0), (@last_id, '$180', 1), (@last_id, '$190', 0), (@last_id, '$195', 0);
