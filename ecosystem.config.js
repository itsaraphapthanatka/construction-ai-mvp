module.exports = {
    apps: [
        {
            name: 'ai-backend',
            script: 'npm',
            args: 'run dev',
            cwd: './backend',
            env: {
                NODE_ENV: 'development'
            }
        },
        {
            name: 'ai-frontend',
            script: 'npm',
            args: 'run dev',
            cwd: './frontend',
            env: {
                NODE_ENV: 'development'
            }
        }
        // หากมีการติดตั้ง Python ค่อยเปิดคอมเมนต์ด้านล่างนี้เพื่อรัน AI Service จริงๆ
        /*,
        {
          name: 'ai-python-service',
          script: 'python',
          args: '-m uvicorn main:app --reload --port 8001',
          cwd: './ai-service'
        }
        */
    ]
};
