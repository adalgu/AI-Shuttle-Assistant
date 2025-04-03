type ParameterType = {
  type: string;
  description: string;
};

type ObjectParameterType = {
  type: 'object';
  properties: {
    [key: string]: ParameterType;
  };
  required: string[];
};

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ObjectParameterType;
  handler: (params: { [key: string]: any }) => Promise<any>;
}
