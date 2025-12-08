import { calculatePasswordStrength } from '../utils/passwordStrength';

const getStrengthColor = (color) => {
    switch (color) {
        case 'error': return 'bg-destructive text-destructive';
        case 'warning': return 'bg-yellow-500 text-yellow-500';
        case 'info': return 'bg-blue-500 text-blue-500';
        case 'primary': return 'bg-primary text-primary';
        case 'success': return 'bg-green-500 text-green-500';
        default: return 'bg-primary text-primary';
    }
};

const PasswordStrengthIndicator = ({ password }) => {
    const strength = calculatePasswordStrength(password);

    if (!password) return null;

    const colorClass = getStrengthColor(strength.color);
    const [bgClass, textClass] = colorClass.split(' ');

    return (
        <div className="mt-2 space-y-1">
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 ease-out ${bgClass}`}
                    style={{ width: `${strength.score}%` }}
                />
            </div>
            <p className={`text-xs font-medium ${textClass}`}>
                Password Strength: {strength.label}
            </p>
        </div>
    );
};

export default PasswordStrengthIndicator;
