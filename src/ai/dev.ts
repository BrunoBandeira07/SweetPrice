'use server';

import {config} from 'dotenv';
config();

import '@/ai/flows/suggest-ingredient-substitutions.ts';
import '@/ai/flows/suggest-crm-action.ts';
import '@/ai/flows/suggest-campaign-tasks.ts';
