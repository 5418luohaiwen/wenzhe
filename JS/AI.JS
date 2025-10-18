// AI文字处理
// 配置DeepSeek API
const DEEPSEEK_CONFIG = {
    API_URL: 'https://api.deepseek.com/v1/chat/completions',
    CHAT_MODEL: 'deepseek-chat',
    REASONER_MODEL: 'deepseek-reasoner'
};

// 语言代码映射 - 修复了目标语言逻辑
const LANGUAGE_MAP = {
    'en': { 
        name: '英语', 
        flag: '🇺🇸', 
        target: 'zh',  // 英语的目标语言是中文
        targetName: '中文',
        targetFlag: '🇨🇳'
    },
    'zh': { 
        name: '中文', 
        flag: '🇨🇳', 
        target: 'en',  // 中文的目标语言是英语
        targetName: '英语',
        targetFlag: '🇺🇸'
    },
    'ja': { 
        name: '日语', 
        flag: '🇯🇵', 
        target: 'zh',
        targetName: '中文',
        targetFlag: '🇨🇳'
    },
    'ko': { 
        name: '韩语', 
        flag: '🇰🇷', 
        target: 'zh',
        targetName: '中文',
        targetFlag: '🇨🇳'
    },
    'fr': { 
        name: '法语', 
        flag: '🇫🇷', 
        target: 'zh',
        targetName: '中文',
        targetFlag: '🇨🇳'
    },
    'de': { 
        name: '德语', 
        flag: '🇩🇪', 
        target: 'zh',
        targetName: '中文',
        targetFlag: '🇨🇳'
    },
    'es': { 
        name: '西班牙语', 
        flag: '🇪🇸', 
        target: 'zh',
        targetName: '中文',
        targetFlag: '🇨🇳'
    },
    'ru': { 
        name: '俄语', 
        flag: '🇷🇺', 
        target: 'zh',
        targetName: '中文',
        targetFlag: '🇨🇳'
    }
};

// 默认语言检测
const DEFAULT_LANGUAGE = 'en';

// DOM元素
const inputText = document.getElementById('input-text');
const outputDisplay = document.getElementById('output-display');
const translateBtn = document.getElementById('translate-btn');
const paraphraseBtn = document.getElementById('paraphrase-btn');
const clearBtn = document.getElementById('clear-btn');
const apiKeyInput = document.getElementById('api-key-input');
const apiStatus = document.getElementById('api-status');
const loading = document.getElementById('loading');
const loadingText = document.getElementById('loading-text');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');
const inputLangText = document.getElementById('input-lang-text');
const outputLangText = document.getElementById('output-lang-text');

// 存储和获取API密钥
function saveApiKey(apiKey) {
    if (apiKey && apiKey.trim() !== '') {
        sessionStorage.setItem('deepseek_api_key', apiKey.trim());
        updateApiStatus(true);
    } else {
        sessionStorage.removeItem('deepseek_api_key');
        updateApiStatus(false);
    }
}

function getApiKey() {
    return sessionStorage.getItem('deepseek_api_key');
}

function updateApiStatus(isValid) {
    if (isValid) {
        apiStatus.textContent = '已设置';
        apiStatus.className = 'api-status api-valid';
    } else {
        apiStatus.textContent = '未设置';
        apiStatus.className = 'api-status api-invalid';
    }
}

// 自动语言检测函数 - 移除了franc依赖
function detectLanguage(text) {
    if (!text || text.trim().length < 2) {
        return DEFAULT_LANGUAGE;
    }

    try {
        // 基于字符的简单启发式检测
        const chineseCharCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
        const totalChars = text.length;
        
        // 如果中文字符数超过总字符数的30%，则认为是中文
        if (chineseCharCount > totalChars * 0.3) {
            return 'zh';
        } else {
            // 检查是否包含常见英文字符
            const englishCharCount = (text.match(/[a-zA-Z]/g) || []).length;
            if (englishCharCount > totalChars * 0.5) {
                return 'en';
            } else {
                // 如果既不是明显的中文也不是明显的英文，默认英文
                return 'en';
            }
        }
    } catch (error) {
        console.error('语言检测错误:', error);
        // 默认英文
        return 'en';
    }
}

// 更新语言显示 - 修复了目标语言显示逻辑
function updateLanguageDisplay(sourceLangCode, isParaphrase = false) {
    const sourceLangInfo = LANGUAGE_MAP[sourceLangCode] || LANGUAGE_MAP[DEFAULT_LANGUAGE];
    
    // 更新输入语言显示
    inputLangText.textContent = `检测到: ${sourceLangInfo.flag} ${sourceLangInfo.name}`;
    
    if (isParaphrase) {
        // 转述功能保持相同语言
        outputLangText.textContent = `转述为: ${sourceLangInfo.flag} ${sourceLangInfo.name}`;
    } else {
        // 翻译功能改变语言
        const targetLangCode = sourceLangInfo.target;
        const targetLangInfo = LANGUAGE_MAP[targetLangCode] || LANGUAGE_MAP['zh'];
        outputLangText.textContent = `翻译为: ${targetLangInfo.flag} ${targetLangInfo.name}`;
    }
}

// 翻译函数 - 仍然使用deepseek-chat
async function translateText() {
    const text = inputText.value.trim();
    
    // 输入验证
    if (!text) {
        showError('请输入要翻译的文本');
        return;
    }

    // 检查API密钥
    const apiKey = getApiKey();
    if (!apiKey) {
        showError('请先输入您的DeepSeek API密钥');
        apiKeyInput.focus();
        return;
    }

    // 显示加载状态
    showLoading('正在检测语言并翻译，请稍候...');
    hideError();
    hideSuccess();

    try {
        // 检测输入语言
        const sourceLang = detectLanguage(text);
        updateLanguageDisplay(sourceLang, false);
        
        // 确定目标语言
        const targetLang = LANGUAGE_MAP[sourceLang].target;
        const sourceLangName = LANGUAGE_MAP[sourceLang].name;
        const targetLangName = LANGUAGE_MAP[targetLang].name;
        
        // 根据语言方向构建翻译指令
        let translationInstruction = '';
        if (sourceLang === 'zh' && targetLang === 'en') {
            translationInstruction = '请将以下中文文本准确翻译成英文：';
        } else if (sourceLang === 'en' && targetLang === 'zh') {
            translationInstruction = '请将以下英文文本准确翻译成中文：';
        } else {
            translationInstruction = `请将以下${sourceLangName}文本准确翻译成${targetLangName}：`;
        }

        // 准备请求数据 - 使用deepseek-chat模型
        const requestData = {
            model: DEEPSEEK_CONFIG.CHAT_MODEL,
            messages: [
                {
                    role: "system",
                    content: "你是一位专业的翻译专家，请准确翻译用户提供的文本，保持原文的意思和风格，不要添加额外信息。"
                },
                {
                    role: "user",
                    content: translationInstruction + "\n" + text
                }
            ],
            temperature: 0.3,
            max_tokens: 2000
        };

        // 发送API请求
        const response = await fetch(DEEPSEEK_CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error('API请求失败: ' + response.status + ' ' + response.statusText);
        }

        const data = await response.json();
        
        // 处理API响应
        if (data.choices && data.choices.length > 0) {
            const translatedText = data.choices[0].message.content;
            outputDisplay.textContent = translatedText;
            showSuccess('翻译完成！');
        } else {
            throw new Error('API返回的数据格式不正确');
        }

    } catch (error) {
        console.error('翻译错误:', error);
        showError('翻译失败: ' + error.message);
    } finally {
        hideLoading();
    }
}

// 转述函数 - 改为使用deepseek-reasoner
async function paraphraseText() {
    const text = inputText.value.trim();
    
    // 输入验证
    if (!text) {
        showError('请输入要转述的文本');
        return;
    }

    // 检查API密钥
    const apiKey = getApiKey();
    if (!apiKey) {
        showError('请先输入您的DeepSeek API密钥');
        apiKeyInput.focus();
        return;
    }

    // 显示加载状态
    showLoading('正在使用深度推理模型转述文本，请稍候...');
    hideError();
    hideSuccess();

    try {
        // 检测输入语言
        const sourceLang = detectLanguage(text);
        updateLanguageDisplay(sourceLang, true);
        
        // 根据语言构建转述指令
        const sourceLangName = LANGUAGE_MAP[sourceLang].name;
        
        // 转述指令 - 强调保留专有名词和专业术语
        let paraphraseInstruction = '';
        if (sourceLang === 'zh') {
            paraphraseInstruction = `请对以下中文文本进行学术转述，要求：
1. 保留所有专有名词、人名、地名、机构名和专业学术术语
2. 改变句式结构和用词，降低与原文的重复率
3. 保持学术严谨性和原文的核心含义
4. 输出语言保持为中文

请逐步思考并分析原文，然后给出转述结果。

需要转述的文本：`;
        } else {
            paraphraseInstruction = `Please paraphrase the following English text for academic purposes, with these requirements:
1. Preserve all proper nouns, names, places, organizations, and specialized academic terminology
2. Change sentence structures and word choices to reduce similarity with the original text
3. Maintain academic rigor and the core meaning of the original
4. Keep the output in English

Please think step by step and analyze the original text before providing the paraphrased version.

Text to paraphrase:`;
        }

        // 准备请求数据 - 使用deepseek-reasoner模型
        const requestData = {
            model: DEEPSEEK_CONFIG.REASONER_MODEL,
            messages: [
                {
                    role: "system",
                    content: "你是一位专业的学术写作助手，擅长文本转述，能够保留专业术语同时改变表达方式。请使用逐步推理来分析文本结构，然后给出高质量的转述结果。"
                },
                {
                    role: "user",
                    content: paraphraseInstruction + "\n" + text
                }
            ],
            temperature: 0.7, // 转述需要更高的创造性
            max_tokens: 4000  // 增加token限制以容纳推理过程
        };

        // 发送API请求
        const response = await fetch(DEEPSEEK_CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error('API请求失败: ' + response.status + ' ' + response.statusText);
        }

        const data = await response.json();
        
        // 处理API响应
        if (data.choices && data.choices.length > 0) {
            const paraphrasedText = data.choices[0].message.content;
            outputDisplay.textContent = paraphrasedText;
            showSuccess('学术转述完成！(使用深度推理模型)');
        } else {
            throw new Error('API返回的数据格式不正确');
        }

    } catch (error) {
        console.error('转述错误:', error);
        showError('转述失败: ' + error.message);
    } finally {
        hideLoading();
    }
}

// 实时语言检测（防抖处理）
let detectTimeout;
function handleInputChange() {
    clearTimeout(detectTimeout);
    const text = inputText.value.trim();
    
    if (text.length > 1) {
        detectTimeout = setTimeout(() => {
            const detectedLang = detectLanguage(text);
            updateLanguageDisplay(detectedLang, false);
        }, 500);
    } else {
        inputLangText.textContent = '等待检测输入语言...';
        outputLangText.textContent = '等待处理结果...';
    }
}

// 清空输入和输出
function clearAll() {
    inputText.value = '';
    outputDisplay.textContent = '处理结果将显示在这里...';
    inputLangText.textContent = '等待检测输入语言...';
    outputLangText.textContent = '等待处理结果...';
    hideError();
    hideSuccess();
}

// UI状态控制函数
function showLoading(message = '正在处理，请稍候...') {
    loadingText.textContent = message;
    loading.style.display = 'block';
    translateBtn.disabled = true;
    paraphraseBtn.disabled = true;
    translateBtn.textContent = '处理中...';
    paraphraseBtn.textContent = '处理中...';
}

function hideLoading() {
    loading.style.display = 'none';
    translateBtn.disabled = false;
    paraphraseBtn.disabled = false;
    translateBtn.textContent = '自动翻译';
    paraphraseBtn.textContent = '学术转述';
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    setTimeout(hideSuccess, 3000);
}

function hideSuccess() {
    successMessage.style.display = 'none';
}

// 事件监听
translateBtn.addEventListener('click', translateText);
paraphraseBtn.addEventListener('click', paraphraseText);
clearBtn.addEventListener('click', clearAll);
inputText.addEventListener('input', handleInputChange);

// API密钥输入事件
apiKeyInput.addEventListener('input', function() {
    saveApiKey(this.value);
});

// 快捷键处理
inputText.addEventListener('keydown', function(e) {
    // Ctrl+Enter 翻译
    if (e.ctrlKey && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        translateText();
    }
    // Ctrl+Shift+Enter 转述
    else if (e.ctrlKey && e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        paraphraseText();
    }
});

// 页面加载完成后
window.addEventListener('load', function() {
    // 检查是否有缓存的API密钥
    const savedApiKey = getApiKey();
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
        updateApiStatus(true);
        // 有密钥时，光标定位到输入框
        inputText.focus();
    } else {
        // 没有密钥时，光标定位到API密钥输入框
        apiKeyInput.focus();
    }
});