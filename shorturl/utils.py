import random, string


def generate_short_code():
    """Generate a random short code."""
    return ''.join(random.choice(string.ascii_letters + string.digits, k=6))