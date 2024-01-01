const postMessageToSlack = async (message: string) => {
    const response = await fetch(Bun.env.SLACK_URL_TEST,
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
}

export default postMessageToSlack