const postMessageToSlack = async (message: string): Promise<boolean> => {
    try {
        const response = await fetch(Bun.env.SLACK_URL, {
            headers: {
                "accept": "application/json",
                "content-type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                text: message,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(
                `Feil ved posting til Slack ${response.status}: ${response.statusText}. Response: ${errorBody}`
            );
            return false;
        }

        return true;
    } catch (error) {
        console.error("Feilet ved posting:", error instanceof Error ? error.message : error);
        return false;
    }
};

export default postMessageToSlack;
