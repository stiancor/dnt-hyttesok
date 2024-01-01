const postMessageToSlack = async (message: string) => {
    try {
        const response = await fetch(Bun.env.SLACK_URL,
            {
                headers: {
                    "accept": "application/json",
                },
                method: "POST",
                body: JSON.stringify({
                    text: message
                })
            })

        if (!response.ok) {
            throw new Error(`Feil ved posting til Slack ${response.status}. Response: ${response.body}`);
        }
    } catch (error) {
        console.error(error);
    }
}

export default postMessageToSlack