import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

export const queryHostAction = createTemplateAction<{
  hostname: string;
}>({
  id: 'banu:cmdb:query-host',
  schema: {
    input: {
      required: ['hostname'],
      type: 'object',
      properties: {
        hostname: { type: 'string' },
      },
    },
    output: {
      type: 'object',
      properties: {
        hostDetails: { type: 'object' },
      },
    },
  },
  async handler(ctx) {
    const { hostname } = ctx.input;

    const response = await fetch(
      `https://dev323201.service-now.com/api/now/table/cmdb_ci?sysparm_query=name=${hostname}&sysparm_limit=1`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization:
            'Basic ' +
            Buffer.from(
              `${process.env.SERVICENOW_USER}:${process.env.SERVICENOW_PASS}`
            ).toString('base64'),
        },
      }
    );

    const data = await response.json();

    if (!data.result || data.result.length === 0) {
      throw new Error(`Host "${hostname}" not found`);
    }

    ctx.output('hostDetails', data.result[0]);
  },
});
