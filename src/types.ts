export type AgentCategory = 'parenting' | 'travel' | 'office' | 'programming' | 'life' | 'finance' | 'design' | 'marketing' | 'custom';

export interface AgentVariable {
  name: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  avatar: string; // Emoji or Lucide icon key
  systemInstruction: string;
  temperature?: number;
  variables?: AgentVariable[];
  isCustom?: boolean;
  author?: string;
  likes?: number;
  runs?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export type WorkflowStepType = 'ai_generate' | 'ai_transform' | 'ai_translate' | 'ai_format';

export interface WorkflowStep {
  id: string;
  name: string;
  type: WorkflowStepType;
  promptTemplate: string; // Can contain placeholders like {{trigger.input_name}} or {{step_id.output}}
  systemInstruction?: string;
  outputVarName: string; // Unique name in execution context to store result
}

export interface WorkflowTriggerInput {
  name: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  triggerInputs: WorkflowTriggerInput[];
  steps: WorkflowStep[];
  isCustom?: boolean;
  author?: string;
  likes?: number;
  runs?: number;
}

export interface WorkflowRunLog {
  stepId: string;
  stepName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  inputParsed?: string;
  output?: string;
  error?: string;
  durationMs?: number;
}

export interface WorkflowRunResult {
  success: boolean;
  logs: WorkflowRunLog[];
  finalOutput: string;
}
