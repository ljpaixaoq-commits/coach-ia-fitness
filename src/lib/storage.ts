import { Profile, Workout, Meal, WaterLog, Supplement, HealthMetric, InjuryPainLog, EvolutionPhoto, Goal } from '../types';

export const INITIAL_PROFILES: Profile[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Leonardo',
    nickname: 'Leo',
    email: 'leonardo@example.com',
    cpf: '11753940761',
    birth_date: '1986-05-17',
    role: 'admin',
    gender: 'male',
    age: 32,
    height: 178,
    current_weight: 84.5,
    target_weight: 75.0,
    body_fat_percentage: 19.2,
    muscle_mass_kg: 63.8,
    activity_level: 'intense',
    fitness_goal: 'lose_weight',
    gym_name: 'Smart Fit Centro',
    preferred_training_time: '07:00',
    daily_water_target_ml: 3500,
    daily_calorie_target: 2200,
    daily_protein_target_g: 170,
    daily_carb_target_g: 190,
    daily_fat_target_g: 55
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Mariana',
    nickname: 'Mari',
    email: 'mariana@example.com',
    role: 'spouse',
    gender: 'female',
    age: 30,
    height: 165,
    current_weight: 62.0,
    target_weight: 58.0,
    body_fat_percentage: 24.5,
    muscle_mass_kg: 41.2,
    activity_level: 'moderate',
    fitness_goal: 'hypertrophy',
    gym_name: 'Smart Fit Centro',
    preferred_training_time: '18:30',
    daily_water_target_ml: 2500,
    daily_calorie_target: 1800,
    daily_protein_target_g: 120,
    daily_carb_target_g: 180,
    daily_fat_target_g: 45
  }
];

export const INITIAL_WORKOUTS: Workout[] = [
  {
    id: 'w-1',
    profile_id: '11111111-1111-1111-1111-111111111111',
    title: 'Treino A - Peito, Tríceps, Ombro & Cardio',
    subtitle: 'Foco em força no supino, densidade de deltoides e queima calórica',
    category: 'Push',
    day_of_week: [1, 4],
    estimated_duration_min: 60,
    difficulty: 'intermediary',
    is_active: true,
    exercises: [
      {
        id: 'e-1',
        workout_id: 'w-1',
        name: 'Supino Reto com Barra',
        muscle_group: 'Peito',
        exercise_type: 'strength',
        sets: 4,
        reps_target: '8-10',
        default_weight_kg: 70,
        rest_time_seconds: 90,
        video_url: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
        demo_instructions: 'Adução escapular, pés firmes no chão, pegada firme e descida controlada até a linha do esterno.',
        order_index: 1,
        completed: false,
        sets_data: [
          { set_number: 1, reps_target: '10', weight_kg: 70, completed: false },
          { set_number: 2, reps_target: '10', weight_kg: 70, completed: false },
          { set_number: 3, reps_target: '8', weight_kg: 72.5, completed: false },
          { set_number: 4, reps_target: '8', weight_kg: 75, completed: false }
        ]
      },
      {
        id: 'e-2',
        workout_id: 'w-1',
        name: 'Supino Inclinado com Halteres',
        muscle_group: 'Peito',
        exercise_type: 'strength',
        sets: 4,
        reps_target: '10-12',
        default_weight_kg: 24,
        rest_time_seconds: 75,
        video_url: 'https://www.youtube.com/watch?v=8iPEnn-ltC8',
        demo_instructions: 'Banco a 30 graus. Foco na porção clavicular (superior) do peitoral.',
        order_index: 2,
        completed: false,
        sets_data: [
          { set_number: 1, reps_target: '12', weight_kg: 24, completed: false },
          { set_number: 2, reps_target: '10', weight_kg: 24, completed: false },
          { set_number: 3, reps_target: '10', weight_kg: 26, completed: false },
          { set_number: 4, reps_target: '8', weight_kg: 26, completed: false }
        ]
      },
      {
        id: 'e-3',
        workout_id: 'w-1',
        name: 'Crucifixo na Polia (Crossover)',
        muscle_group: 'Peito',
        exercise_type: 'strength',
        sets: 3,
        reps_target: '12-15',
        default_weight_kg: 15,
        rest_time_seconds: 60,
        video_url: 'https://www.youtube.com/watch?v=taI4XduLpTk',
        demo_instructions: 'Alongamento máximo no retorno e contração de pico no centro.',
        order_index: 3,
        completed: false,
        sets_data: [
          { set_number: 1, reps_target: '15', weight_kg: 15, completed: false },
          { set_number: 2, reps_target: '12', weight_kg: 15, completed: false },
          { set_number: 3, reps_target: '12', weight_kg: 17.5, completed: false }
        ]
      },
      {
        id: 'e-4',
        workout_id: 'w-1',
        name: 'Desenvolvimento Militar com Halteres',
        muscle_group: 'Ombro',
        exercise_type: 'strength',
        sets: 4,
        reps_target: '8-10',
        default_weight_kg: 18,
        rest_time_seconds: 90,
        video_url: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
        demo_instructions: 'Empurrar os halteres verticalmente com abdômen contraído, sem arquear a lombar.',
        order_index: 4,
        completed: false,
        sets_data: [
          { set_number: 1, reps_target: '10', weight_kg: 18, completed: false },
          { set_number: 2, reps_target: '10', weight_kg: 18, completed: false },
          { set_number: 3, reps_target: '8', weight_kg: 20, completed: false },
          { set_number: 4, reps_target: '8', weight_kg: 20, completed: false }
        ]
      },
      {
        id: 'e-5',
        workout_id: 'w-1',
        name: 'Elevação Lateral no Cabo',
        muscle_group: 'Ombro',
        exercise_type: 'strength',
        sets: 4,
        reps_target: '12-15',
        default_weight_kg: 8,
        rest_time_seconds: 60,
        video_url: 'https://www.youtube.com/watch?v=PPrzBWZDOhA',
        demo_instructions: 'Polia na altura da coxa. Tensão contínua no deltoide lateral sem impulso.',
        order_index: 5,
        completed: false,
        sets_data: [
          { set_number: 1, reps_target: '15', weight_kg: 8, completed: false },
          { set_number: 2, reps_target: '15', weight_kg: 8, completed: false },
          { set_number: 3, reps_target: '12', weight_kg: 9, completed: false },
          { set_number: 4, reps_target: '12', weight_kg: 9, completed: false }
        ]
      },
      {
        id: 'e-6',
        workout_id: 'w-1',
        name: 'Tríceps Corda no Cross',
        muscle_group: 'Tríceps',
        exercise_type: 'strength',
        sets: 4,
        reps_target: '12-15',
        default_weight_kg: 25,
        rest_time_seconds: 60,
        video_url: 'https://www.youtube.com/watch?v=vB5OHsJ3EME',
        demo_instructions: 'Abrir as pontas da corda na fase final para máxima contração lateral do tríceps.',
        order_index: 6,
        completed: false,
        sets_data: [
          { set_number: 1, reps_target: '15', weight_kg: 25, completed: false },
          { set_number: 2, reps_target: '12', weight_kg: 25, completed: false },
          { set_number: 3, reps_target: '12', weight_kg: 27.5, completed: false },
          { set_number: 4, reps_target: '10', weight_kg: 30, completed: false }
        ]
      },
      {
        id: 'e-7',
        workout_id: 'w-1',
        name: 'Esteira - Caminhada Inclinada (Cardio)',
        muscle_group: 'Cardio',
        exercise_type: 'cardio',
        sets: 1,
        reps_target: '20 min',
        duration_minutes: 20,
        default_weight_kg: 0,
        rest_time_seconds: 0,
        video_url: 'https://www.youtube.com/watch?v=3iXk5m79gC8',
        demo_instructions: 'Inclinação 6% a 8%, velocidade 5.5 a 6.0 km/h. Excelente para queima de gordura sem impacto no joelho.',
        order_index: 7,
        completed: false,
        sets_data: [
          { set_number: 1, reps_target: '20 min', weight_kg: 0, completed: false }
        ]
      }
    ]
  },
  {
    id: 'w-2',
    profile_id: '11111111-1111-1111-1111-111111111111',
    title: 'Treino B - Costas, Bíceps & Abdômen',
    subtitle: 'Foco em largura de dorsais, espessura e bíceps',
    category: 'Pull',
    day_of_week: [2, 5],
    estimated_duration_min: 55,
    difficulty: 'intermediary',
    is_active: true,
    exercises: [
      {
        id: 'e-201',
        workout_id: 'w-2',
        name: 'Puxada Alta Frontal na Polia',
        muscle_group: 'Costas',
        exercise_type: 'strength',
        sets: 4,
        reps_target: '10-12',
        default_weight_kg: 55,
        rest_time_seconds: 75,
        video_url: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
        demo_instructions: 'Puxar a barra até a altura da clavícula, direcionando os cotovelos para baixo e para trás.',
        order_index: 1,
        completed: false,
        sets_data: [
          { set_number: 1, reps_target: '12', weight_kg: 55, completed: false },
          { set_number: 2, reps_target: '10', weight_kg: 55, completed: false },
          { set_number: 3, reps_target: '10', weight_kg: 60, completed: false },
          { set_number: 4, reps_target: '8', weight_kg: 65, completed: false }
        ]
      },
      {
        id: 'e-202',
        workout_id: 'w-2',
        name: 'Remada Curvada com Barra',
        muscle_group: 'Costas',
        exercise_type: 'strength',
        sets: 4,
        reps_target: '8-10',
        default_weight_kg: 50,
        rest_time_seconds: 90,
        video_url: 'https://www.youtube.com/watch?v=kBWAon7ItDw',
        demo_instructions: 'Tronco inclinado a 45 graus, coluna alinhada e puxada trazendo a barra no umbigo.',
        order_index: 2,
        completed: false,
        sets_data: [
          { set_number: 1, reps_target: '10', weight_kg: 50, completed: false },
          { set_number: 2, reps_target: '10', weight_kg: 50, completed: false },
          { set_number: 3, reps_target: '8', weight_kg: 55, completed: false },
          { set_number: 4, reps_target: '8', weight_kg: 55, completed: false }
        ]
      },
      {
        id: 'e-203',
        workout_id: 'w-2',
        name: 'Rosca Direta com Barra W',
        muscle_group: 'Bíceps',
        exercise_type: 'strength',
        sets: 3,
        reps_target: '10-12',
        default_weight_kg: 26,
        rest_time_seconds: 60,
        video_url: 'https://www.youtube.com/watch?v=in7PaeYlhrM',
        demo_instructions: 'Manter cotovelos fixos ao lado do corpo, flexionando sem balanço.',
        order_index: 3,
        completed: false,
        sets_data: [
          { set_number: 1, reps_target: '12', weight_kg: 26, completed: false },
          { set_number: 2, reps_target: '10', weight_kg: 26, completed: false },
          { set_number: 3, reps_target: '10', weight_kg: 28, completed: false }
        ]
      },
      {
        id: 'e-204',
        workout_id: 'w-2',
        name: 'Bicicleta Ergométrica (Cardio)',
        muscle_group: 'Cardio',
        exercise_type: 'cardio',
        sets: 1,
        reps_target: '15 min',
        duration_minutes: 15,
        default_weight_kg: 0,
        rest_time_seconds: 0,
        video_url: 'https://www.youtube.com/watch?v=3iXk5m79gC8',
        demo_instructions: 'Cadência constante de 75-85 RPM. Sem impacto articular.',
        order_index: 4,
        completed: false,
        sets_data: [
          { set_number: 1, reps_target: '15 min', weight_kg: 0, completed: false }
        ]
      }
    ]
  },
  {
    id: 'w-3',
    profile_id: '11111111-1111-1111-1111-111111111111',
    title: 'Treino C - Pernas & Core (Adaptado Joelho)',
    subtitle: 'Protocolo Knee-Safe sem sobrecarga patelar excessiva',
    category: 'Legs',
    day_of_week: [3, 6],
    estimated_duration_min: 50,
    difficulty: 'intermediary',
    ai_generated: true,
    is_active: true,
    exercises: [
      {
        id: 'e-301',
        workout_id: 'w-3',
        name: 'Cadeira Extensora Isométrica',
        muscle_group: 'Quadríceps',
        exercise_type: 'isometric',
        sets: 4,
        reps_target: '45 seg',
        default_weight_kg: 35,
        rest_time_seconds: 60,
        video_url: 'https://www.youtube.com/watch?v=YyvSfVjQeL0',
        demo_instructions: 'Sustentar a 60 graus de flexão por 45 segundos. Estimula o tendão patelar sem atrito.',
        order_index: 1,
        completed: false,
        sets_data: [
          { set_number: 1, reps_target: '45s', weight_kg: 35, completed: false },
          { set_number: 2, reps_target: '45s', weight_kg: 35, completed: false },
          { set_number: 3, reps_target: '45s', weight_kg: 40, completed: false },
          { set_number: 4, reps_target: '45s', weight_kg: 40, completed: false }
        ]
      },
      {
        id: 'e-302',
        workout_id: 'w-3',
        name: 'Mesa Flexora (Posteriores de Coxa)',
        muscle_group: 'Posterior',
        exercise_type: 'strength',
        sets: 4,
        reps_target: '10-12',
        default_weight_kg: 40,
        rest_time_seconds: 75,
        video_url: 'https://www.youtube.com/watch?v=1Tq3QdYUuHs',
        demo_instructions: 'Contração firme nos isquiotibiais, estabilizando os joelhos.',
        order_index: 2,
        completed: false,
        sets_data: [
          { set_number: 1, reps_target: '12', weight_kg: 40, completed: false },
          { set_number: 2, reps_target: '10', weight_kg: 40, completed: false },
          { set_number: 3, reps_target: '10', weight_kg: 45, completed: false },
          { set_number: 4, reps_target: '8', weight_kg: 45, completed: false }
        ]
      },
      {
        id: 'e-303',
        workout_id: 'w-3',
        name: 'Elevação Pélvica com Barra',
        muscle_group: 'Glúteos',
        exercise_type: 'strength',
        sets: 4,
        reps_target: '10-12',
        default_weight_kg: 80,
        rest_time_seconds: 90,
        video_url: 'https://www.youtube.com/watch?v=SEdqd1n0cvg',
        demo_instructions: 'Pico de contração de 2 segundos no topo, apoiando escápulas no banco.',
        order_index: 3,
        completed: false,
        sets_data: [
          { set_number: 1, reps_target: '12', weight_kg: 80, completed: false },
          { set_number: 2, reps_target: '10', weight_kg: 80, completed: false },
          { set_number: 3, reps_target: '10', weight_kg: 85, completed: false },
          { set_number: 4, reps_target: '8', weight_kg: 90, completed: false }
        ]
      }
    ]
  }
];

export const INITIAL_SUPPLEMENTS: Supplement[] = [
  {
    id: 's-1',
    profile_id: '11111111-1111-1111-1111-111111111111',
    name: 'Minha Mistura Personalizada',
    is_custom_blend: true,
    dosage: '1 scoop (16g)',
    recipe_formula: 'Creatina Monohidratada 5g + Beta-Alanina 3g + L-Citrulina 6g + Cafeína Anidra 200mg + Taurina 1g',
    recommended_time: '30 min antes do treino',
    current_stock_doses: 22,
    min_stock_alert: 7,
    unit: 'doses',
    notes: 'Manipulada em farmácia de confiança. Excelente foco e pump sem ansiedade.',
    is_active: true
  },
  {
    id: 's-2',
    profile_id: '11111111-1111-1111-1111-111111111111',
    name: 'Vitamina D3 5000 UI + K2',
    is_custom_blend: false,
    dosage: '1 cápsula',
    recipe_formula: 'Colecalciferol 5.000 UI + MK-7 100mcg',
    recommended_time: 'Café da manhã',
    current_stock_doses: 45,
    min_stock_alert: 10,
    unit: 'cápsulas',
    notes: 'Absorção otimizada com a refeição.',
    is_active: true
  },
  {
    id: 's-3',
    profile_id: '11111111-1111-1111-1111-111111111111',
    name: 'Vitamina B12 (Metilcobalamina)',
    is_custom_blend: false,
    dosage: '1 pastilha sublingual (1000mcg)',
    recommended_time: 'Em jejum pela manhã',
    current_stock_doses: 28,
    min_stock_alert: 7,
    unit: 'pastilhas',
    is_active: true
  },
  {
    id: 's-4',
    profile_id: '11111111-1111-1111-1111-111111111111',
    name: 'Whey Protein Isolado',
    is_custom_blend: false,
    dosage: '1 scoop (30g = 26g proteína)',
    recommended_time: 'Pós-treino ou lanche',
    current_stock_doses: 18,
    min_stock_alert: 5,
    unit: 'doses',
    is_active: true
  }
];

export const INITIAL_INJURIES: InjuryPainLog[] = [
  {
    id: 'inj-1',
    profile_id: '11111111-1111-1111-1111-111111111111',
    body_part: 'Joelho Direito (Tendinopatia Patelar)',
    pain_level: 2,
    status: 'monitoring',
    injury_date: '2026-06-15',
    symptoms: 'Desconforto em agachamentos profundos com cargas superiores a 90kg ou saltos.',
    restricted_exercises: ['Agachamento Livre pesado', 'Leg Press 45 pés baixos', 'Saltos na caixa'],
    recommended_exercises: ['Cadeira Extensora Isométrica 45s', 'Agachamento Búlgaro leve', 'Mesa Flexora', 'Elevação Pélvica'],
    treatment_notes: 'Crioterapia 20 min pós-treino, alongamento de reto femoral e liberação miofascial com rolo.',
    logged_at: new Date().toISOString()
  }
];

export const INITIAL_MEALS: Meal[] = [
  {
    id: 'm-1',
    profile_id: '11111111-1111-1111-1111-111111111111',
    meal_type: 'breakfast',
    title: 'Café da Manhã Energético',
    consumed_at: new Date().toISOString().split('T')[0] + 'T07:30:00',
    total_calories: 480,
    total_protein_g: 38,
    total_carbs_g: 45,
    total_fats_g: 14,
    items: [
      { id: 'i-1', meal_id: 'm-1', food_name: 'Ovos Inteiros Mexidos (3 unid)', portion_g: 150, calories: 215, protein_g: 18, carbs_g: 2, fats_g: 15 },
      { id: 'i-2', meal_id: 'm-1', food_name: 'Pão Integral (2 fatias)', portion_g: 50, calories: 130, protein_g: 6, carbs_g: 24, fats_g: 1.5 },
      { id: 'i-3', meal_id: 'm-1', food_name: 'Queijo Cottage', portion_g: 60, calories: 60, protein_g: 8, carbs_g: 2, fats_g: 1 }
    ]
  },
  {
    id: 'm-2',
    profile_id: '11111111-1111-1111-1111-111111111111',
    meal_type: 'lunch',
    title: 'Almoço Balanceado',
    consumed_at: new Date().toISOString().split('T')[0] + 'T12:30:00',
    total_calories: 650,
    total_protein_g: 52,
    total_carbs_g: 60,
    total_fats_g: 18,
    items: [
      { id: 'i-5', meal_id: 'm-2', food_name: 'Peito de Frango Grelhado', portion_g: 180, calories: 290, protein_g: 48, carbs_g: 0, fats_g: 6 },
      { id: 'i-6', meal_id: 'm-2', food_name: 'Arroz Branco Cozido', portion_g: 160, calories: 205, protein_g: 4, carbs_g: 45, fats_g: 0.5 },
      { id: 'i-7', meal_id: 'm-2', food_name: 'Feijão Carioca', portion_g: 100, calories: 75, protein_g: 5, carbs_g: 14, fats_g: 0.5 }
    ]
  }
];

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'g-1',
    profile_id: '11111111-1111-1111-1111-111111111111',
    title: 'Alcançar 75 kg com definição',
    category: 'weight',
    current_value: 84.5,
    target_value: 75.0,
    unit: 'kg',
    deadline: '2026-12-31',
    status: 'in_progress'
  },
  {
    id: 'g-2',
    profile_id: '11111111-1111-1111-1111-111111111111',
    title: 'Frequência de 5 treinos semanais',
    category: 'workout_frequency',
    current_value: 4,
    target_value: 5,
    unit: 'dias/sem',
    status: 'in_progress'
  },
  {
    id: 'g-3',
    profile_id: '11111111-1111-1111-1111-111111111111',
    title: 'Meta de 3,5 Litros de Água',
    category: 'water',
    current_value: 2.2,
    target_value: 3.5,
    unit: 'litros',
    status: 'in_progress'
  },
  {
    id: 'g-4',
    profile_id: '11111111-1111-1111-1111-111111111111',
    title: 'Dormir 7h30 por noite',
    category: 'sleep',
    current_value: 7.2,
    target_value: 7.5,
    unit: 'horas',
    status: 'in_progress'
  },
  {
    id: 'g-5',
    profile_id: '11111111-1111-1111-1111-111111111111',
    title: 'Atingir 10.000 passos diários',
    category: 'steps',
    current_value: 8400,
    target_value: 10000,
    unit: 'passos',
    status: 'in_progress'
  }
];

export const INITIAL_HEALTH_METRICS: HealthMetric[] = [
  {
    id: 'hm-1',
    profile_id: '11111111-1111-1111-1111-111111111111',
    measured_at: '2026-08-15',
    weight_kg: 86.8,
    bmi: 27.4,
    body_fat_pct: 21.5,
    muscle_mass_kg: 62.5,
    systolic_bp: 122,
    diastolic_bp: 82,
    blood_glucose_mg_dl: 94,
    sleep_hours: 7.0,
    energy_level: 7,
    chest_cm: 104,
    waist_cm: 89,
    abdomen_cm: 93,
    right_arm_cm: 38.0,
    right_thigh_cm: 61.5
  },
  {
    id: 'hm-2',
    profile_id: '11111111-1111-1111-1111-111111111111',
    measured_at: '2026-08-25',
    weight_kg: 85.6,
    bmi: 27.0,
    body_fat_pct: 20.4,
    muscle_mass_kg: 63.1,
    systolic_bp: 120,
    diastolic_bp: 80,
    blood_glucose_mg_dl: 92,
    sleep_hours: 7.5,
    energy_level: 8,
    chest_cm: 105,
    waist_cm: 87.5,
    abdomen_cm: 91,
    right_arm_cm: 38.5,
    right_thigh_cm: 62.0
  },
  {
    id: 'hm-3',
    profile_id: '11111111-1111-1111-1111-111111111111',
    measured_at: '2026-09-05',
    weight_kg: 84.5,
    bmi: 26.7,
    body_fat_pct: 19.2,
    muscle_mass_kg: 63.8,
    systolic_bp: 118,
    diastolic_bp: 78,
    blood_glucose_mg_dl: 89,
    sleep_hours: 7.3,
    energy_level: 8,
    chest_cm: 106,
    waist_cm: 86.0,
    abdomen_cm: 89,
    right_arm_cm: 39.0,
    right_thigh_cm: 62.5
  }
];

export const INITIAL_PHOTOS: EvolutionPhoto[] = [
  {
    id: 'p-1',
    profile_id: '11111111-1111-1111-1111-111111111111',
    photo_type: 'front',
    photo_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80',
    weight_kg: 86.8,
    body_fat_pct: 21.5,
    taken_at: '2026-08-15',
    notes: 'Início do protocolo de definição.'
  },
  {
    id: 'p-2',
    profile_id: '11111111-1111-1111-1111-111111111111',
    photo_type: 'front',
    photo_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
    weight_kg: 84.5,
    body_fat_pct: 19.2,
    taken_at: '2026-09-05',
    notes: 'Menos retenção no abdômen e melhor densidade nos ombros.'
  },
  {
    id: 'p-3',
    profile_id: '11111111-1111-1111-1111-111111111111',
    photo_type: 'side',
    photo_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80',
    weight_kg: 84.5,
    body_fat_pct: 19.2,
    taken_at: '2026-09-05',
    notes: 'Postura melhorada.'
  }
];