const complete_answer_requirement = `
    - Arithmetic: The final answer should be a number rather than an expression.
    - Factorization: The final answer should be a completely factored expression within real numbers. 
        * Example 1: factorization of x^3+2*x^2-2x-4:
        Correct final answer: (x+sqrt(2))(x-sqrt(2))(x+2) 
        Wrong final answer: (x^2-2)(x+2), because (x^2-2) can be further factored as (x+sqrt(2))(x-sqrt(2)) in the range of real numbers. 
        * Example 2: factorization of x^3+x^2+x+1: 
        Correct final answer: (x+1)(x^2+1), because x^2+1 cannot be further factored in the range of real numbers.
    - Equation Solving: The final answer should be variable(s) with all the root(s) that are real numbers and satisfy the equation.
        * Example 1: solving x^2-5x+6=0
        Correct final answer: x=2, x=3
        Wrong final answer 1: x=2, x=3, x=4, because x=4 is not a root of the equation.
        Wrong final answer 2: x=2, because x=3 is also a root of the equation.
        * Example 2: solving 3/x+6/(x-1)=(x-3)/(x(x-1))
        Correct final answer: No root, because when multiplying both sides by x(x-1), the equation becomes 3(x-1)+6x=x-3 => x=0, but when x=0, the equation is not defined.
        Wrong answer: x=0, because x=0 is not a root of the equation.
`;

const expression_format_requirement = `
    - Use "+" for addition
    - Use "-" for subtraction
    - Use "*" for multiplication
    - Use "/" for division
    - Use "^" for exponentiation
    - Use "sqrt" for square root, for example: sqrt(2) for square root of 2
    - Use "()" for grouping, for example: (2+3)*4 for (2+3)*4
    - User "+/-" for positive/negative sign, for example: 2+/-3 for 2+3 or 2-3
    - Do not use to separate operators and operands, for example: 2+3*4 rather than 2 + 3 * 4
    - Group the entire numerator and denominator in a fraction if it is not a number but an expression, for example: 1/(2+3) rather than 1/2+3, (sqrt(2)+1)/(2+3) rather than sqrt(2)+1/2+3
    - Mixed fractions should be converted to improper fractions, for example: 1 1/2 should be written as 3/2  
    - -a^b means -(a^b) rather than (-a)^b. For example, -2^3 = -(2^3) = -8
    - ax^b means a*(x^b) rather than (a*x)^b. For example, 2x^3 = 2*(x^3) rather than (2*x)^3
`;

export const prompt_rubric =`
In the input, there is an image of a printed math question and a handwritten student answer. 

Guidelines:

1. Based on the problem expression, determine the problem type from the following list and store them in the "problem_type" field:
    - if the expression has only numbers, it is an arithmetic problem.
    - if the expression has variables and numbers but there is no "=" sign, it is a factorization problem.
    - if the expression has variables, numbers, and "=" sign, it is an equation solving problem.
    
2. Solve the problem step by step and store each step in the "steps" list. Make exactly 3 steps for each problem type.
    Each step should:
    - Be appropriate for middle school level
    - Show key mathematical reasoning
    The final answer should fulfill the following requirements based on the problem type:
    ${complete_answer_requirement}
    Store the steps in the "expression" field within the "rubrics" list.
    Describe the step in the "description" field within the "rubrics" list.

3. Assign a point to each step based on the importance of the step in solving the problem to make it 5 points in total. Store the points in the "total_points" field within the "rubrics" list.

4. Explanation and format for the input and output: 
    ${expression_format_requirement}
   
5. Include remarks only if there are specific issues or concerns
`;

export const prompt_grade = `
    Task Overview:
    Grade middle school algebra answers based on provided rubrics following the steps below: 
    
    Input Format: 
    A list of strings including:
     - An image of a printed math question and a handwritten student answer. 
     - The student's answer expressions.
    A JSON string representing the rubrics.
    
    Guidelines:
    - If a step is different from the rubric but it is mathematically equivalent to the previous step, it is correct and assign the points on case by case basis.
    - The first expression is the original problem expression, do not grade it or include it in the steps.
    - The answer is considered complete only if the final answer fulfill the following requirements based on the problem type:
    ${complete_answer_requirement}
    - Explanation and format for the input and output: 
    ${expression_format_requirement}
    - If an answer is correct and the answer has more than or equal to 2 steps, assign the total points of 5 to the answer.
    - For equation solving problems with multiple roots, the student may write "x_1 = 3" and "x_2 = 4" as separate steps. Please treat them as a single step in this case. 
`;

