
'use client';
import { Firestore, collection, doc, writeBatch } from "firebase/firestore";
import { INITIAL_INGREDIENTS, INITIAL_RECIPES, INITIAL_CUSTOMERS, INITIAL_ORDERS } from "@/lib/constants";

// This function seeds the database for a new user.
export const seedInitialData = async (userId: string, db: Firestore) => {
    console.log(`Seeding initial data for new user: ${userId}`);
    const batch = writeBatch(db);

    // 1. Seed Ingredients
    const ingredientsCollection = collection(db, 'ingredients');
    INITIAL_INGREDIENTS.forEach(ingredientData => {
        const docRef = doc(ingredientsCollection);
        batch.set(docRef, { ...ingredientData, id: docRef.id, userId });
    });
    
    // 2. Seed Recipes and their items
    const recipesCollection = collection(db, 'recipes');

    // Bolo de Chocolate
    const boloRecipeRef = doc(recipesCollection);
    const boloIngredients = [
        { name: 'Farinha de Trigo', quantity: 250, unit: 'g' },
        { name: 'Açúcar Refinado', quantity: 200, unit: 'g' },
        { name: 'Ovos', quantity: 3, unit: 'un' },
        { name: 'Manteiga Sem Sal', quantity: 100, unit: 'g' },
        { name: 'Chocolate em Pó 50%', quantity: 50, unit: 'g' },
    ];
    const boloItems = boloIngredients.map(item => {
        const ingredient = INITIAL_INGREDIENTS.find(i => i.name === item.name);
        const cost = (ingredient?.unitCost || 0) * item.quantity;
        return {
            id: `item-${Date.now()}-${Math.random()}`,
            type: 'ingredient',
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            cost: cost,
            ingredient: { id: `initial-${item.name}`, name: item.name }, // Store as reference-like object
        }
    });
    const boloRecipeData = {
        ...INITIAL_RECIPES[0],
        id: boloRecipeRef.id,
        userId,
        items: boloItems,
    };
    batch.set(boloRecipeRef, boloRecipeData);

    // Cento de Brigadeiros
    const brigadeiroRecipeRef = doc(recipesCollection);
    const brigadeiroIngredients = [
        { name: 'Leite Condensado', quantity: 395 * 2, unit: 'g' },
        { name: 'Chocolate em Pó 50%', quantity: 100, unit: 'g' },
        { name: 'Manteiga Sem Sal', quantity: 50, unit: 'g' },
    ];
    const brigadeiroItems = brigadeiroIngredients.map(item => {
        const ingredient = INITIAL_INGREDIENTS.find(i => i.name === item.name);
        const cost = (ingredient?.unitCost || 0) * item.quantity;
        return {
            id: `item-${Date.now()}-${Math.random()}`,
            type: 'ingredient',
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            cost: cost,
            ingredient: { id: `initial-${item.name}`, name: item.name }, // Store as reference-like object
        }
    });
     const brigadeiroRecipeData = {
        ...INITIAL_RECIPES[1],
        id: brigadeiroRecipeRef.id,
        userId,
        items: brigadeiroItems,
    };
    batch.set(brigadeiroRecipeRef, brigadeiroRecipeData);

    // 3. Seed Customers
    const customersCollection = collection(db, 'customers');
    INITIAL_CUSTOMERS.forEach(customerData => {
        const docRef = doc(customersCollection);
        batch.set(docRef, { ...customerData, id: docRef.id, userId });
    });

    // 4. Seed Orders
    const ordersCollection = collection(db, 'orders');
    
    // Order 1
    const order1Ref = doc(ordersCollection);
    batch.set(order1Ref, {
        ...INITIAL_ORDERS[0],
        id: order1Ref.id,
        userId,
        items: [{ recipe: { id: boloRecipeRef.id, name: boloRecipeData.name, suggestedPrice: boloRecipeData.suggestedPrice }, quantity: 1 }],
    });

    // Order 2
    const order2Ref = doc(ordersCollection);
    batch.set(order2Ref, {
        ...INITIAL_ORDERS[1],
        id: order2Ref.id,
        userId,
        items: [{ recipe: { id: brigadeiroRecipeRef.id, name: brigadeiroRecipeData.name, suggestedPrice: brigadeiroRecipeData.suggestedPrice }, quantity: 1 }],
    });
    
    // Order 3
    const order3Ref = doc(ordersCollection);
    batch.set(order3Ref, {
        ...INITIAL_ORDERS[2],
        id: order3Ref.id,
        userId,
        customerName: 'Mariana Oliveira', // Customer from constants
        items: [{ recipe: { id: boloRecipeRef.id, name: boloRecipeData.name, suggestedPrice: boloRecipeData.suggestedPrice }, quantity: 2 }],
    });


    // 5. Seed Settings (to prevent re-seeding)
    const settingsRef = doc(db, 'settings', userId);
    batch.set(settingsRef, {
        id: userId,
        userId: userId,
        monthlyGoal: 5000,
    });
    
    // 6. Seed Costs
    const costsRef = doc(db, 'costs', userId);
    batch.set(costsRef, {
        id: userId,
        userId: userId,
        kwhPrice: 0.92,
        proLabore: 2000,
        indirectCostsRate: 10,
        taxRate: 4,
        creditCardFee: 2.5,
        gasCylinderSize: '13',
        gasCylinderPrice: 110,
        stoveBurnerFlow: 0.225, // kg/h for a medium burner
    });


    try {
        await batch.commit();
        console.log(`Successfully seeded data for user: ${userId}`);
    } catch (error) {
        console.error("Error seeding initial data:", error);
    }
};
